const { app, BrowserWindow, Menu, Tray, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');
const net = require('net');
const fs = require('fs');
const { fork } = require('child_process');

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let serverProcess = null;
let currentServerUrl = '';
let allocatedPort = 3010;

// Config file in userData for saving custom Server URL & window bounds
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
      const fallbackServer = net.createServer();
      fallbackServer.listen(0, () => {
        const port = fallbackServer.address().port;
        fallbackServer.close(() => resolve(port));
      });
    });
  });
}

// Ping / Test connection with latency
function pingUrl(targetUrl, timeoutMs = 7000) {
  return new Promise((resolve) => {
    const start = Date.now();
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(targetUrl, (res) => {
        resolve({ ok: true, latency: Date.now() - start, statusCode: res.statusCode });
      });
      req.on('error', (e) => {
        resolve({ ok: false, error: e.message || 'Cannot reach server' });
      });
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve({ ok: false, error: 'Connection timed out (' + timeoutMs + 'ms)' });
      });
    } catch (err) {
      resolve({ ok: false, error: 'Invalid URL format' });
    }
  });
}

// Wait for server to become responsive
function waitForServer(url, timeoutMs = 30000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      pingUrl(url, 2500).then((res) => {
        if (res.ok) {
          resolve();
        } else if (Date.now() - startTime > timeoutMs) {
          reject(new Error(res.error || 'Server start timed out'));
        } else {
          setTimeout(check, 600);
        }
      });
    };
    check();
  });
}

// Start Standalone Next.js Server if running in local standalone mode
async function startLocalNextServer(port) {
  if (!app.isPackaged) return; // In dev, we use dev server

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

function openSettingsDialog() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  const iconPath = path.join(__dirname, 'icon.png');

  settingsWindow = new BrowserWindow({
    width: 580,
    height: 520,
    resizable: false,
    parent: mainWindow,
    modal: true,
    title: 'ตั้งค่าการเชื่อมต่อเซิร์ฟเวอร์ - FMS',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '#FAF5F2',
  });

  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
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
        {
          label: 'พิมพ์หน้านี้ (Print)...',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow && mainWindow.webContents.print(),
        },
        { type: 'separator' },
        {
          label: 'ตั้งค่าการเชื่อมต่อเซิร์ฟเวอร์ (Server Settings)...',
          accelerator: 'CmdOrCtrl+,',
          click: () => openSettingsDialog(),
        },
        { type: 'separator' },
        {
          label: 'ซ่อนหน้าต่าง (Minimize to Tray)',
          click: () => mainWindow && mainWindow.hide(),
        },
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
          label: 'เปิดโฟลเดอร์การตั้งค่า (Open Config Folder)',
          click: () => shell.showItemInFolder(getConfigFilePath()),
        },
        { type: 'separator' },
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

function createSystemTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  if (!fs.existsSync(iconPath)) return;

  try {
    tray = new Tray(iconPath);
    const trayMenu = Menu.buildFromTemplate([
      {
        label: 'เปิดระบบ FMS',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: 'ตั้งค่าเซิร์ฟเวอร์...',
        click: () => openSettingsDialog(),
      },
      {
        label: 'รีโหลด',
        click: () => mainWindow && mainWindow.reload(),
      },
      { type: 'separator' },
      {
        label: 'ออกจากโปรแกรม',
        click: () => app.quit(),
      },
    ]);

    tray.setToolTip('ระบบบริหารจัดการองค์กร FMS - วิทยาลัยสงฆ์บุรีรัมย์');
    tray.setContextMenu(trayMenu);

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (e) {
    console.error('Failed to create system tray:', e);
  }
}

async function loadMainUrl() {
  if (!mainWindow) return;

  try {
    console.log('[Electron] Connecting to server at:', currentServerUrl);
    await waitForServer(currentServerUrl, 15000);
    mainWindow.loadURL(currentServerUrl);
  } catch (err) {
    console.error('[Electron] Server unreachable, loading offline fallback page:', err.message);
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));
  }
}

async function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');
  const config = loadSavedConfig();

  const width = config.bounds?.width || 1440;
  const height = config.bounds?.height || 900;
  const x = config.bounds?.x;
  const y = config.bounds?.y;

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
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
    show: false,
    backgroundColor: '#FAF5F2',
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Save bounds on resize/move
  const saveBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    const cfg = loadSavedConfig();
    cfg.bounds = bounds;
    saveConfig(cfg);
  };
  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  createApplicationMenu();
  createSystemTray();

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

  await loadMainUrl();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:get-server-url', () => currentServerUrl);
ipcMain.handle('app:get-config', () => loadSavedConfig());
ipcMain.handle('app:test-connection', async (event, url) => {
  return await pingUrl(url);
});
ipcMain.handle('app:save-config', async (event, cfg) => {
  const currentCfg = loadSavedConfig();
  const merged = { ...currentCfg, ...cfg };
  saveConfig(merged);

  if (cfg.customServerUrl) {
    currentServerUrl = cfg.customServerUrl;
  } else if (!app.isPackaged) {
    currentServerUrl = process.env.DEV_SERVER_URL || 'http://localhost:3010';
  } else {
    currentServerUrl = `http://localhost:${allocatedPort}`;
  }

  if (settingsWindow) {
    settingsWindow.close();
  }

  await loadMainUrl();
  return true;
});
ipcMain.handle('app:retry-connection', async () => {
  await loadMainUrl();
  return true;
});
ipcMain.handle('app:open-settings', () => {
  openSettingsDialog();
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
