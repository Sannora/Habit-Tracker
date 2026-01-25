import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Books.css';

function Books() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, reading, completed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const allBooks = await window.electronAPI.books.getAll();
      setBooks(allBooks);
      setLoading(false);
    } catch (error) {
      console.error('Kitaplar yüklenirken hata:', error);
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    if (confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
      try {
        await window.electronAPI.books.delete(id);
        loadBooks(); // Listeyi yenile
      } catch (error) {
        console.error('Kitap silinirken hata:', error);
      }
    }
  };

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    return book.status === filter;
  });

  const getProgressPercentage = (current, total) => {
    return Math.round((current / total) * 100);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📚 Kitaplarım</h1>
          <p>Okuduğun ve okumakta olduğun kitaplar</p>
        </div>
        <Link to="/add-book" className="btn btn-primary">
          ➕ Yeni Kitap Ekle
        </Link>
      </div>

      {/* Filtreler */}
      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tümü ({books.length})
        </button>
        <button 
          className={filter === 'reading' ? 'active' : ''}
          onClick={() => setFilter('reading')}
        >
          Okunanlar ({books.filter(b => b.status === 'reading').length})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Tamamlananlar ({books.filter(b => b.status === 'completed').length})
        </button>
      </div>

      {/* Kitap Listesi */}
      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <p>🤷‍♂️ Henüz kitap eklenmemiş</p>
          <Link to="/add-book" className="btn btn-secondary">
            İlk kitabını ekle
          </Link>
        </div>
      ) : (
                <div className="books-grid">
          {filteredBooks.map(book => {
            const progress = getProgressPercentage(book.current_page, book.total_pages);
            
            return (
              <div key={book.id} className="book-card">
                <div 
                  className="book-cover" 
                  style={{ background: book.cover_color }}
                >
                  <div className="book-status">
                    {book.status === 'completed' ? '✓' : '📖'}
                  </div>
                </div>
                
                <div className="book-info">
                  <h3>{book.title}</h3>
                  {book.author && <p className="author">{book.author}</p>}
                  
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progress}%`,
                          background: book.cover_color 
                        }}
                      ></div>
                    </div>
                    <p className="progress-text">
                      {book.current_page} / {book.total_pages} sayfa ({progress}%)
                    </p>
                  </div>

                  <div className="book-actions">
                    <button 
                      onClick={() => navigate(`/edit-book/${book.id}`)}
                      className="btn-icon edit"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => deleteBook(book.id)}
                      className="btn-icon delete"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Books;