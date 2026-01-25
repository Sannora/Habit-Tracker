const { ipcMain, dialog, app } = require('electron');
const { booksDB, sessionsDB, statsDB, userDB, dataDB } = require('./database.cjs');
const fs = require('fs');
const path = require('path');

function setupIPCHandlers() {
  // ===== BOOKS =====
  ipcMain.handle('books:getAll', () => booksDB.getAll());
  ipcMain.handle('books:getById', (event, id) => booksDB.getById(id));
  ipcMain.handle('books:getActive', () => booksDB.getActive());
  ipcMain.handle('books:create', (event, book) => booksDB.create(book));
  ipcMain.handle('books:update', (event, id, book) => booksDB.update(id, book));
  ipcMain.handle('books:delete', (event, id) => booksDB.delete(id));

  // ===== READING SESSIONS =====
  ipcMain.handle('sessions:getAll', () => sessionsDB.getAll());
  ipcMain.handle('sessions:getById', (event, id) => sessionsDB.getById(id));
  ipcMain.handle('sessions:getByDateRange', (event, start, end) => 
    sessionsDB.getByDateRange(start, end)
  );
  ipcMain.handle('sessions:getByBook', (event, bookId) => 
    sessionsDB.getByBook(bookId)
  );
  ipcMain.handle('sessions:create', (event, session) => 
    sessionsDB.create(session)
  );
  ipcMain.handle('sessions:update', (event, id, session) => 
    sessionsDB.update(id, session)
  );
  ipcMain.handle('sessions:delete', (event, id) => sessionsDB.delete(id));

  // ===== STATS =====
  ipcMain.handle('stats:getTotalPages', () => statsDB.getTotalPages());
  ipcMain.handle('stats:getLast30Days', () => statsDB.getLast30Days());
  ipcMain.handle('stats:getDailyAverage', () => statsDB.getDailyAverage());

  // ===== USER =====
  ipcMain.handle('user:get', () => userDB.get());
  ipcMain.handle('user:update', (event, user) => userDB.update(user));

  // ===== DATA MANAGEMENT - YENİ! =====
  ipcMain.handle('data:export', async () => {
    try {
      // Kaydetme dialogu aç
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Verileri Dışa Aktar',
        defaultPath: path.join(app.getPath('documents'), `reading-tracker-backup-${Date.now()}.json`),
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });

      if (canceled || !filePath) {
        return { success: false, cancelled: true };
      }

      // Verileri al
      const data = dataDB.exportAll();

      // Dosyaya yaz
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

      return { success: true, path: filePath };
    } catch (error) {
      console.error('Export hatası:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('data:import', async () => {
    try {
      // Dosya seçme dialogu aç
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: 'Verileri İçe Aktar',
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) {
        return { success: false, cancelled: true };
      }

      // Dosyayı oku
      const fileContent = fs.readFileSync(filePaths[0], 'utf8');
      const importData = JSON.parse(fileContent);

      // Verileri içe aktar
      const result = dataDB.importAll(importData.data);

      if (result.success) {
        return { 
          success: true, 
          imported: result.imported.books + result.imported.sessions 
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Import hatası:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('data:reset', async () => {
    try {
      const result = dataDB.resetAll();
      return result;
    } catch (error) {
      console.error('Reset hatası:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('✅ IPC Handlers kuruldu');
}

module.exports = { setupIPCHandlers };