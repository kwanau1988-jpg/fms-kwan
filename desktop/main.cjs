const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const net = require('net');
const fs = require('fs');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
let currentServerUrl = '';
let allocatedPort = 3010;

// Config file in userData for saving custom Server URL
function getConfigFilePath() {
  return path.join(app.getPath('userData'), 'fms-config.json');
}

function loadSavedConfig() {
  try {
    const p = getConfigFilePath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
  return {};
}

function saveConfig(cfg) {
  try {
    const p = getConfigFilePath();
    fs.writeFileSync(p, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save config:', e);
  }
}

// Find a free port
function getFreePort(startingPort = 3010) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startingPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      // If port is taken, try port 0 (OS assigned)
      const fallbackServer = net.createServer();
      fallbackServer.listen(0, () => {
        const port = fallbackServer.address().port;
        fallbackServer.close(() => resolve(port));
      });
    });
  });
}

// Wait for server to become responsive
function waitForServer(url, timeoutMs = 45000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        // Any HTTP response (200, 302, 307, 404, etc.) means server is alive
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Server start timed out after ' + timeoutMs + 'ms'));
        } else {
          setTimeout(check, 600);
        }
      });
      req.setTimeout(2000, () => {
        req.destroy();
        setTimeout(check, 600);
      });
    };
    check();
  });
}

// Start Standalone Next.js Server if running in local standalone mode
async function startLocalNextServer(port) {
  if (!app.isPackaged) return; // In dev, we use dev server

  // Look for standalone server.js in various potential unpack paths
  const possiblePaths = [
    path.join(process.resourcesPath, 'standalone', 'server.js'),
    path.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js'),
    path.join(process.resourcesPath, '.next', 'standalone', 'server.js'),
    path.join(__dirname, '..', '.next', 'standalone', 'server.js'),
  ];

  let serverJsPath = possiblePaths.find(p => fs.existsSync(p));

  if (!serverJsPath) {
    console.log('[Electron] Standalone server.js not found in local package, running in client-only mode.');
    return;
  }

  console.log('[Electron] Starting local Next.js standalone server from:', serverJsPath);

  const env = {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'production',
    HOSTNAME: '127.0.0.1',
  };

  serverProcess = fork(serverJsPath, [], {
    env,
    stdio: 'pipe',
  });

  serverProcess.stdout?.on('data', (d) => console.log('[Next.js stdout]', d.toString()));
  serverProcess.stderr?.on('data', (d) => console.error('[Next.js stderr]', d.toString()));

  serverProcess.on('exit', (code) => {
    console.log('[Next.js server exited with code]', code);
  });
}

function createApplicationMenu() {
  const template = [
    {
      label: 'ระบบ (System)',
      submenu: [
        {
          label: 'หน้าหลัก (Home)',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            if (mainWindow && currentServerUrl) {
              mainWindow.loadURL(currentServerUrl);
            }
          },
        },
        {
          label: 'รีโหลด (Reload)',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.reload(),
        },
        { type: 'separator' },
        {
          label: 'ตั้งค่าการเชื่อมต่อเซิร์ฟเวอร์ (Server Settings)...',
          click: async () => {
            const config = loadSavedConfig();
            const { response } = await dialog.showMessageBox(mainWindow, {
              type: 'question',
              buttons: ['ใช้เซิร์ฟเวอร์ในเครื่อง (Local)', 'ระบุ URL เซิร์ฟเวอร์กลาง (Custom URL)', 'ยกเลิก'],
              defaultId: 0,
              title: 'ตั้งค่าเซิร์ฟเวอร์',
              message: 'เลือกรูปแบบการเชื่อมต่อระบบ:',
              detail: `เซิร์ฟเวอร์ปัจจุบัน: ${currentServerUrl}\n\nหากต้องการเชื่อมต่อกับเซิร์ฟเวอร์กลางของวิทยาลัย (เช่น http://192.168.1.xxx:3010) ให้เลือก "ระบุ URL เซิร์ฟเวอร์กลาง"`,
            });

            if (response === 0) {
              // Local
              delete config.customServerUrl;
              saveConfig(config);
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                message: 'บันทึกการตั้งค่าแล้ว โปรแกรมจะเริ่มทำงานใหม่',
              }).then(() => {
                app.relaunch();
                app.exit(0);
              });
            } else if (response === 1) {
              // We open a prompt or ask user
              // For simplicity and stability, show current guidance
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'การระบุ URL เซิร์ฟเวอร์กลาง',
                message: 'แก้ไขไฟล์ตั้งค่าเซิร์ฟเวอร์',
                detail: `ไฟล์ตั้งค่าอยู่ที่:\n${getConfigFilePath()}\n\nสามารถใส่: { "customServerUrl": "http://your-server-ip:3010" }`,
                buttons: ['เปิดโฟลเดอร์ตั้งค่า', 'ตกลง'],
              }).then((res) => {
                if (res.response === 0) {
                  shell.showItemInFolder(getConfigFilePath());
                }
              });
            }
          },
        },
        { type: 'separator' },
        {
          label: 'ออกจากโปรแกรม (Exit)',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'แก้ไข (Edit)',
      submenu: [
        { label: 'เลิกทำ (Undo)', role: 'undo' },
        { label: 'ทำซ้ำ (Redo)', role: 'redo' },
        { type: 'separator' },
        { label: 'ตัด (Cut)', role: 'cut' },
        { label: 'คัดลอก (Copy)', role: 'copy' },
        { label: 'วาง (Paste)', role: 'paste' },
        { label: 'เลือกทั้งหมด (Select All)', role: 'selectAll' },
      ],
    },
    {
      label: 'มุมมอง (View)',
      submenu: [
        { label: 'ซูมเข้า (Zoom In)', role: 'zoomIn' },
        { label: 'ซูมออก (Zoom Out)', role: 'zoomOut' },
        { label: 'ขนาดปกติ (Reset Zoom)', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'เต็มจอ (Toggle Fullscreen)', role: 'togglefullscreen' },
        {
          label: 'เครื่องมือนักพัฒนา (Developer Tools)',
          accelerator: 'F12',
          click: () => mainWindow && mainWindow.webContents.toggleDevTools(),
        },
      ],
    },
    {
      label: 'ช่วยเหลือ (Help)',
      submenu: [
        {
          label: 'เกี่ยวกับระบบ FMS (About)',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'เกี่ยวกับระบบบริหารจัดการองค์กร FMS',
              message: 'ระบบบริหารจัดการองค์กร (FMS Management System)',
              detail: 'วิทยาลัยสงฆ์บุรีรัมย์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย\nเวอร์ชันเดสก์ท็อป 1.0.0 (Windows PC)\nเทคโนโลยี: Next.js 16 + React 19 + Electron 44',
              buttons: ['ตกลง'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    title: 'ระบบบริหารจัดการองค์กร - วิทยาลัยสงฆ์บุรีรัมย์',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    show: false, // show when ready to prevent flicker
    backgroundColor: '#FAF5F2',
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  createApplicationMenu();

  const config = loadSavedConfig();
  if (config.customServerUrl) {
    currentServerUrl = config.customServerUrl;
    console.log('[Electron] Using custom server URL:', currentServerUrl);
  } else if (!app.isPackaged) {
    currentServerUrl = process.env.DEV_SERVER_URL || 'http://localhost:3010';
  } else {
    allocatedPort = await getFreePort(3010);
    currentServerUrl = `http://localhost:${allocatedPort}`;
    await startLocalNextServer(allocatedPort);
  }

  try {
    console.log('[Electron] Connecting to server at:', currentServerUrl);
    await waitForServer(currentServerUrl, 30000);
    mainWindow.loadURL(currentServerUrl);
  } catch (err) {
    console.error('[Electron] Failed to connect to server:', err);
    dialog.showErrorBox(
      'ข้อผิดพลาดการเชื่อมต่อ',
      `ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ระบบได้ที่: ${currentServerUrl}\n\nกรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดใช้งานอยู่ หรือตรวจสอบการตั้งค่าเครือข่าย`
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:get-server-url', () => currentServerUrl);
ipcMain.handle('app:set-server-url', (event, url) => {
  const cfg = loadSavedConfig();
  cfg.customServerUrl = url;
  saveConfig(cfg);
  return true;
});

// App lifecycle
app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function cleanup() {
  if (serverProcess) {
    console.log('[Electron] Killing background Next.js server process...');
    try {
      serverProcess.kill();
    } catch (e) {
      console.error('Error killing server process:', e);
    }
    serverProcess = null;
  }
}

app.on('before-quit', cleanup);
app.on('window-all-closed', () => {
  cleanup();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
