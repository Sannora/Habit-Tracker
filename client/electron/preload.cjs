const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  
  // Books API
  books: {
    getAll: () => ipcRenderer.invoke('books:getAll'),
    getById: (id) => ipcRenderer.invoke('books:getById', id),
    getActive: () => ipcRenderer.invoke('books:getActive'),
    create: (book) => ipcRenderer.invoke('books:create', book),
    update: (id, book) => ipcRenderer.invoke('books:update', id, book),
    delete: (id) => ipcRenderer.invoke('books:delete', id),
  },

  // Reading Sessions API
  sessions: {
    getAll: () => ipcRenderer.invoke('sessions:getAll'),
    getById: (id) => ipcRenderer.invoke('sessions:getById', id),
    getByDateRange: (start, end) => ipcRenderer.invoke('sessions:getByDateRange', start, end),
    getByBook: (bookId) => ipcRenderer.invoke('sessions:getByBook', bookId),
    create: (session) => ipcRenderer.invoke('sessions:create', session),
    update: (id, session) => ipcRenderer.invoke('sessions:update', id, session),
    delete: (id) => ipcRenderer.invoke('sessions:delete', id),
  },

  // Stats API
  stats: {
    getTotalPages: () => ipcRenderer.invoke('stats:getTotalPages'),
    getLast30Days: () => ipcRenderer.invoke('stats:getLast30Days'),
    getDailyAverage: () => ipcRenderer.invoke('stats:getDailyAverage'),
  },

  // User API
  user: {
    get: () => ipcRenderer.invoke('user:get'),
    update: (user) => ipcRenderer.invoke('user:update', user),
  },

  // Data Management API - YENİ!
  data: {
    export: () => ipcRenderer.invoke('data:export'),
    import: () => ipcRenderer.invoke('data:import'),
    reset: () => ipcRenderer.invoke('data:reset'),
  }
});