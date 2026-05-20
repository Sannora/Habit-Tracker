const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initDatabase } = require('./database.cjs');
const { setupIPCHandlers } = require('./ipc-handlers.cjs');

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Reading Tracker',
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(
      app.getAppPath(),
      'dist',
      'index.html'
    );

    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  initDatabase();
  setupIPCHandlers();
  createWindow();
});
