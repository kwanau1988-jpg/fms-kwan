const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDesktop: true,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getServerUrl: () => ipcRenderer.invoke('app:get-server-url'),
  setServerUrl: (url) => ipcRenderer.invoke('app:set-server-url', url),
});
