const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDesktop: true,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getServerUrl: () => ipcRenderer.invoke('app:get-server-url'),
  getConfig: () => ipcRenderer.invoke('app:get-config'),
  saveConfig: (cfg) => ipcRenderer.invoke('app:save-config', cfg),
  testConnection: (url) => ipcRenderer.invoke('app:test-connection', url),
  retryConnection: () => ipcRenderer.invoke('app:retry-connection'),
  openSettingsWindow: () => ipcRenderer.invoke('app:open-settings'),
});
