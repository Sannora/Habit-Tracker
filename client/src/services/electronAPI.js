// Electron API'yi wrap ediyoruz, böylece ileride web'e geçerken sadece bu dosyayı değiştirmemiz yeterli

class ElectronAPIService {
  constructor() {
    this.api = window.electronAPI;
  }

  // Books
  async getBooks() {
    return await this.api.books.getAll();
  }

  async getBookById(id) {
    return await this.api.books.getById(id);
  }

  async getActiveBooks() {
    return await this.api.books.getActive();
  }

  async createBook(book) {
    return await this.api.books.create(book);
  }

  async updateBook(id, book) {
    return await this.api.books.update(id, book);
  }

  async deleteBook(id) {
    return await this.api.books.delete(id);
  }

  // Sessions
  async getSessions() {
    return await this.api.sessions.getAll();
  }

  async getSessionById(id) {
    return await this.api.sessions.getById(id);
  }

  async getSessionsByDateRange(start, end) {
    return await this.api.sessions.getByDateRange(start, end);
  }

  async getSessionsByBook(bookId) {
    return await this.api.sessions.getByBook(bookId);
  }

  async createSession(session) {
    return await this.api.sessions.create(session);
  }

  async updateSession(id, session) {
    return await this.api.sessions.update(id, session);
  }

  async deleteSession(id) {
    return await this.api.sessions.delete(id);
  }

  // Stats
  async getTotalPages() {
    return await this.api.stats.getTotalPages();
  }

  async getLast30Days() {
    return await this.api.stats.getLast30Days();
  }

  async getDailyAverage() {
    return await this.api.stats.getDailyAverage();
  }

  // User
  async getUser() {
    return await this.api.user.get();
  }

  async updateUser(user) {
    return await this.api.user.update(user);
  }

  // Data
  async exportData() {
    return await this.api.data.export();
  }

  async importData() {
    return await this.api.data.import();
  }

  async resetData() {
    return await this.api.data.reset();
  }
}

// Singleton instance
const electronAPI = new ElectronAPIService();

export default electronAPI;