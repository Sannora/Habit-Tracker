import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Forms.css'

function AddReading() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    book_id: '',
    date: new Date().toISOString().split('T')[0], // Bugünün tarihi
    pages_read: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const activeBooks = await window.electronAPI.books.getActive();
      setBooks(activeBooks);
      
      // İlk kitabı otomatik seç
      if (activeBooks.length > 0 && !formData.book_id) {
        handleBookSelect(activeBooks[0].id);
      }
    } catch (error) {
      console.error('Kitaplar yüklenirken hata:', error);
    }
  };

  const handleBookSelect = async (bookId) => {
    setFormData(prev => ({ ...prev, book_id: bookId }));
    
    // Seçilen kitabın bilgilerini al
    try {
      const book = await window.electronAPI.books.getById(bookId);
      setSelectedBook(book);
    } catch (error) {
      console.error('Kitap bilgisi alınırken hata:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.book_id) {
      alert('Lütfen bir kitap seçin!');
      return;
    }

    if (!formData.pages_read || formData.pages_read < 1) {
      alert('Lütfen okuduğunuz sayfa sayısını girin!');
      return;
    }

    setLoading(true);

    try {
      await window.electronAPI.sessions.create({
        book_id: parseInt(formData.book_id),
        date: formData.date,
        pages_read: parseInt(formData.pages_read),
        notes: formData.notes.trim() || null
      });

      // Başarılı, dashboard'a yönlendir
      navigate('/');
    } catch (error) {
      console.error('Okuma kaydı eklenirken hata:', error);
      alert('Okuma kaydı eklenirken bir hata oluştu!');
      setLoading(false);
    }
  };

  const getNewProgress = () => {
    if (!selectedBook || !formData.pages_read) return null;
    
    const newCurrent = selectedBook.current_page + parseInt(formData.pages_read);
    const percentage = Math.round((newCurrent / selectedBook.total_pages) * 100);
    
    return {
      current: Math.min(newCurrent, selectedBook.total_pages),
      percentage: Math.min(percentage, 100)
    };
  };

  const progress = getNewProgress();

  if (books.length === 0) {
    return (
      <div className="page">
        <div className="empty-state" style={{ paddingTop: '100px' }}>
          <h2>📚 Henüz aktif kitap yok</h2>
          <p>Okuma kaydı eklemek için önce bir kitap eklemelisin!</p>
          <button 
            onClick={() => navigate('/add-book')}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            ➕ Kitap Ekle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📖 Okuma Kaydı Ekle</h1>
          <p>Bugün okuduğun sayfaları kaydet</p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="reading-form">
          {/* Kitap Seçimi */}
          <div className="form-group">
            <label htmlFor="book_id">Kitap Seç *</label>
            <select
              id="book_id"
              name="book_id"
              value={formData.book_id}
              onChange={(e) => handleBookSelect(e.target.value)}
              required
            >
              <option value="">Bir kitap seçin...</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.current_page}/{book.total_pages})
                </option>
              ))}
            </select>
          </div>

          {/* Tarih */}
          <div className="form-group">
            <label htmlFor="date">Tarih *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Sayfa Sayısı */}
          <div className="form-group">
            <label htmlFor="pages_read">Okunan Sayfa Sayısı *</label>
            <input
              type="number"
              id="pages_read"
              name="pages_read"
              value={formData.pages_read}
              onChange={handleChange}
              placeholder="örn: 50"
              min="1"
              required
            />
          </div>

          {/* İlerleme Göstergesi */}
          {selectedBook && progress && (
            <div className="progress-info">
              <p className="progress-label">
                <strong>İlerleme:</strong> {selectedBook.current_page} → <span className="highlight">{progress.current}</span> / {selectedBook.total_pages} sayfa
              </p>
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large"
                  style={{ 
                    width: `${progress.percentage}%`,
                    background: selectedBook.cover_color 
                  }}
                ></div>
              </div>
              <p className="progress-percent">{progress.percentage}% tamamlandı</p>
              
              {progress.current >= selectedBook.total_pages && (
                <div className="completion-badge">
                  🎉 Tebrikler! Bu kayıtla kitabı tamamlayacaksın!
                </div>
              )}
            </div>
          )}

          {/* Notlar */}
          <div className="form-group">
            <label htmlFor="notes">Notlar (Opsiyonel)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Bugünkü okuma deneyimin hakkında notlar..."
              rows="4"
            />
          </div>

          {/* Butonlar */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              disabled={loading}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : '✓ Kaydı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddReading;