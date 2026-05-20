const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Kullanıcının verilerini kaydedecek klasör
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'reading-tracker.db');

console.log('📁 Veritabanı yolu:', dbPath);

// Veritabanını aç (yoksa oluştur)
const db = new Database(dbPath, { verbose: console.log });

// Tabloları oluştur
function initDatabase() {
  // Users tablosu (şimdilik tek kullanıcı)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Okuyucu',
      daily_goal INTEGER DEFAULT 50,
      theme TEXT DEFAULT 'light',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Books tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      total_pages INTEGER NOT NULL,
      current_page INTEGER DEFAULT 0,
      status TEXT DEFAULT 'reading',
      notes TEXT,
      cover_color TEXT DEFAULT '#4A90E2',
      start_date DATE,
      end_date DATE,
      rating REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reading Sessions tablosu (günlük kayıtlar)
  db.exec(`
    CREATE TABLE IF NOT EXISTS reading_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      date DATE NOT NULL,
      pages_read INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  // İlk kullanıcıyı oluştur (eğer yoksa)
  const userExists = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userExists.count === 0) {
    db.prepare('INSERT INTO users (name, daily_goal) VALUES (?, ?)').run('Okuyucu', 50);
    console.log('✅ İlk kullanıcı oluşturuldu');
  }

  console.log('✅ Veritabanı hazır!');
}

// CRUD Fonksiyonları

// ===== BOOKS =====
const booksDB = {
  // Tüm kitapları getir
  getAll: () => {
    return db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
  },

  // ID'ye göre kitap getir
  getById: (id) => {
    return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  },

  // Aktif kitapları getir (reading durumunda)
  getActive: () => {
    return db.prepare("SELECT * FROM books WHERE status = 'reading' ORDER BY created_at DESC").all();
  },

  // Yeni kitap ekle
  create: (book) => {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, total_pages, current_page, status, cover_color, start_date, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      book.title,
      book.author || null,
      book.total_pages,
      book.current_page || 0,
      book.status || 'reading',
      book.cover_color || '#4A90E2',
      book.start_date || new Date().toISOString().split('T')[0]
    );
    return result.lastInsertRowid;
  },

// Kitap güncelle
update: (id, book) => {
  const stmt = db.prepare(`
    UPDATE books 
    SET title = ?, author = ?, total_pages = ?, current_page = ?, 
        status = ?, cover_color = ?, rating = ?
    WHERE id = ?
  `);

  stmt.run(
    book.title,
    book.author || null,
    book.total_pages,
    book.current_page,
    book.status,
    book.cover_color,
    book.rating || 0,
    id
  );

  return booksDB.getById(id);
},

  // Kitap sil
  delete: (id) => {
    db.prepare('DELETE FROM books WHERE id = ?').run(id);
  }
};

// ===== READING SESSIONS =====
const sessionsDB = {
  // Tüm kayıtları getir
  getAll: () => {
    return db.prepare(`
      SELECT rs.*, b.title as book_title 
      FROM reading_sessions rs
      LEFT JOIN books b ON rs.book_id = b.id
      ORDER BY rs.date DESC
    `).all();
  },

  // Belirli bir tarih aralığındaki kayıtları getir
  getByDateRange: (startDate, endDate) => {
    return db.prepare(`
      SELECT rs.*, b.title as book_title, b.cover_color
      FROM reading_sessions rs
      LEFT JOIN books b ON rs.book_id = b.id
      WHERE rs.date BETWEEN ? AND ?
      ORDER BY rs.date DESC
    `).all(startDate, endDate);
  },

  // Belirli bir kitabın kayıtlarını getir
  getByBook: (bookId) => {
    return db.prepare(`
      SELECT * FROM reading_sessions 
      WHERE book_id = ? 
      ORDER BY date DESC
    `).all(bookId);
  },

  // Yeni kayıt ekle
  create: (session) => {
    const stmt = db.prepare(`
      INSERT INTO reading_sessions (book_id, date, pages_read, notes)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      session.book_id,
      session.date || new Date().toISOString().split('T')[0],
      session.pages_read,
      session.notes || null
    );

    // Kitabın current_page'ini güncelle
    const book = booksDB.getById(session.book_id);
    if (book) {
      const newCurrentPage = book.current_page + session.pages_read;
      db.prepare('UPDATE books SET current_page = ? WHERE id = ?').run(
        Math.min(newCurrentPage, book.total_pages),
        session.book_id
      );

      // Kitap bittiyse durumunu güncelle
      if (newCurrentPage >= book.total_pages) {
        db.prepare("UPDATE books SET status = 'completed', end_date = ? WHERE id = ?").run(
          session.date,
          session.book_id
        );
      }
    }

    return result.lastInsertRowid;
  },

    // OKUMA KAYDI GÜNCELLE
  update: (id, session) => {
    // Önce eski kaydı al
    const oldSession = db.prepare('SELECT * FROM reading_sessions WHERE id = ?').get(id);
    
    if (!oldSession) return null;

    // Kitabın current_page'ini eski değere geri al
    const book = booksDB.getById(oldSession.book_id);
    if (book) {
      const revertedPage = book.current_page - oldSession.pages_read;
      db.prepare('UPDATE books SET current_page = ? WHERE id = ?').run(
        Math.max(0, revertedPage),
        oldSession.book_id
      );
    }

    // Yeni değerleri güncelle
    db.prepare(`
      UPDATE reading_sessions 
      SET pages_read = ?, notes = ?, date = ?
      WHERE id = ?
    `).run(
      session.pages_read,
      session.notes || null,
      session.date || oldSession.date,
      id
    );

    // Kitabın current_page'ini yeni değerle güncelle
    if (book) {
      const newCurrentPage = Math.max(0, book.current_page - oldSession.pages_read) + session.pages_read;
      db.prepare('UPDATE books SET current_page = ? WHERE id = ?').run(
        Math.min(newCurrentPage, book.total_pages),
        oldSession.book_id
      );

      // Kitap bittiyse durumunu güncelle
      if (newCurrentPage >= book.total_pages) {
        db.prepare("UPDATE books SET status = 'completed', end_date = ? WHERE id = ?").run(
          session.date || oldSession.date,
          oldSession.book_id
        );
      } else {
        // Tamamlanmış kitap geri açılmışsa durumu değiştir
        db.prepare("UPDATE books SET status = 'reading', end_date = NULL WHERE id = ?").run(
          oldSession.book_id
        );
      }
    }

    return db.prepare('SELECT * FROM reading_sessions WHERE id = ?').get(id);
  },
  
  // ID'ye göre session getir
  getById: (id) => {
    return db.prepare('SELECT * FROM reading_sessions WHERE id = ?').get(id);
  },

  // Kayıt sil
  delete: (id) => {
    const session = db.prepare('SELECT * FROM reading_sessions WHERE id = ?').get(id);
    if (session) {
      // Kitabın current_page'ini geri al
      const book = booksDB.getById(session.book_id);
      if (book) {
        const newCurrentPage = Math.max(0, book.current_page - session.pages_read);
        db.prepare('UPDATE books SET current_page = ? WHERE id = ?').run(
          newCurrentPage,
          session.book_id
        );
      }
    }
    db.prepare('DELETE FROM reading_sessions WHERE id = ?').run(id);
  }
};

// ===== İSTATİSTİKLER =====
const statsDB = {
  // Toplam okunan sayfa
  getTotalPages: () => {
    const result = db.prepare('SELECT SUM(pages_read) as total FROM reading_sessions').get();
    return result.total || 0;
  },

  // Son 30 günün istatistikleri
  getLast30Days: () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    return db.prepare(`
      SELECT date, SUM(pages_read) as pages
      FROM reading_sessions
      WHERE date >= ?
      GROUP BY date
      ORDER BY date ASC
    `).all(startDate);
  },

  // Günlük ortalama
  getDailyAverage: () => {
    const result = db.prepare(`
      SELECT AVG(daily_total) as average
      FROM (
        SELECT SUM(pages_read) as daily_total
        FROM reading_sessions
        GROUP BY date
      )
    `).get();
    return Math.round(result.average || 0);
  }
};

// ===== USER =====
const userDB = {
  get: () => {
    return db.prepare('SELECT * FROM users WHERE id = 1').get();
  },

  update: (user) => {
    db.prepare('UPDATE users SET name = ?, daily_goal = ?, theme = ? WHERE id = 1').run(
      user.name,
      user.daily_goal,
      user.theme
    );
    return userDB.get();
  }
};

// ===== DATA MANAGEMENT =====
const dataDB = {
  // Tüm verileri dışa aktar
  exportAll: () => {
    const users = db.prepare('SELECT * FROM users').all();
    const books = db.prepare('SELECT * FROM books').all();
    const sessions = db.prepare('SELECT * FROM reading_sessions').all();

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        users,
        books,
        sessions
      }
    };
  },

  // Verileri içe aktar
  importAll: (data) => {
    try {
      // Transaction başlat
      db.exec('BEGIN TRANSACTION');

      // Mevcut verileri temizle
      db.exec('DELETE FROM reading_sessions');
      db.exec('DELETE FROM books');
      db.exec('DELETE FROM users');

      // Users
      if (data.users && data.users.length > 0) {
        const userStmt = db.prepare(`
          INSERT INTO users (id, name, daily_goal, theme, created_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        data.users.forEach(user => {
          userStmt.run(user.id, user.name, user.daily_goal, user.theme, user.created_at);
        });
      }

      // Books
      if (data.books && data.books.length > 0) {
        const bookStmt = db.prepare(`
          INSERT INTO books (id, title, author, total_pages, current_page, status, cover_color, start_date, end_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.books.forEach(book => {
          bookStmt.run(
            book.id, book.title, book.author, book.total_pages, 
            book.current_page, book.status, book.cover_color, 
            book.start_date, book.end_date, book.created_at
          );
        });
      }

      // Reading Sessions
      if (data.sessions && data.sessions.length > 0) {
        const sessionStmt = db.prepare(`
          INSERT INTO reading_sessions (id, book_id, date, pages_read, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        data.sessions.forEach(session => {
          sessionStmt.run(
            session.id, session.book_id, session.date, 
            session.pages_read, session.notes, session.created_at
          );
        });
      }

      // Commit
      db.exec('COMMIT');

      return {
        success: true,
        imported: {
          users: data.users?.length || 0,
          books: data.books?.length || 0,
          sessions: data.sessions?.length || 0
        }
      };
    } catch (error) {
      // Hata olursa rollback
      db.exec('ROLLBACK');
      console.error('Import hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Tüm verileri sıfırla
  resetAll: () => {
    try {
      db.exec('BEGIN TRANSACTION');
      
      db.exec('DELETE FROM reading_sessions');
      db.exec('DELETE FROM books');
      db.exec('DELETE FROM users');
      
      // Varsayılan kullanıcı oluştur
      db.prepare('INSERT INTO users (name, daily_goal, theme) VALUES (?, ?, ?)').run(
        'Okuyucu', 50, 'light'
      );
      
      db.exec('COMMIT');
      
      return { success: true };
    } catch (error) {
      db.exec('ROLLBACK');
      console.error('Reset hatası:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = {
  initDatabase,
  booksDB,
  sessionsDB,
  statsDB,
  userDB,
  dataDB,
  db
};