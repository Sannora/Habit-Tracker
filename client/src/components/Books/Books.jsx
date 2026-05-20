import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Books.css';

import StarRating from '../StarRating/StarRating';

function Books() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [localRatings, setLocalRatings] = useState({});

  const formatDate = (date) => {
    if (!date) return null;
    
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDuration = (start, end) => {
    if (!start || !end) return null;
    
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await window.electronAPI.books.getAll();
    setBooks(data);
  };

  const filtered = books.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const progress = (c, t) => Math.round((c / t) * 100);

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>📚 Kitaplarım</h1>
          <p>Kitaplarını yönet</p>
        </div>

        <Link to="/add-book" className="btn btn-primary">
          ➕ Yeni Kitap Ekle
        </Link>
      </div>

      <div className="filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Tümü</button>
        <button className={filter === 'reading' ? 'active' : ''} onClick={() => setFilter('reading')}>Okunanlar</button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Tamamlananlar</button>
      </div>

      <div className="books-grid">
        {filtered.map(b => {
          const p = progress(b.current_page, b.total_pages);

          return (
            <div key={b.id} className="book-card">

              <div className="book-cover" style={{ background: b.cover_color }}>
                <div className="book-status">
                  {b.status === 'completed' ? '✓' : '📖'}
                </div>
              </div>

              <div className="book-info">
                <h3>{b.title}</h3>
                {b.author && <p className="author">{b.author}</p>}
                <div className="book-dates">
                  {b.start_date && (
                    <div className="date-line">
                      Başlangıç: {formatDate(b.start_date)}
                    </div>
                  )}

                  {b.end_date && (
                    <div className="date-line">
                      Bitiş: {formatDate(b.end_date)}
                    </div>
                  )}

                  {b.start_date && b.end_date && (
                    <div className="duration-line">
                      ⏱️ {getDuration(b.start_date, b.end_date)} günde tamamlandı
                    </div>
                  )}
                </div>

                <div className="progress-section">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${p}%`,
                        background: b.cover_color
                      }}
                    />
                  </div>

                  <p className="progress-text">
                    {b.current_page}/{b.total_pages} ({p}%)
                  </p>
                </div>

                {/* ⭐ STAR RATING (CLEAN) */}
                <div className="book-rating">
                  <StarRating
                    value={localRatings[b.id] ?? b.rating ?? 0}
                    onChange={async (val) => {
                      setLocalRatings(prev => ({
                        ...prev,
                        [b.id]: val
                      }));

                      await window.electronAPI.books.update(b.id, {
                        ...b,
                        rating: val
                      });
                    }}
                  />
                </div>

                <div className="book-actions">
                  <button
                    className="btn-icon edit"
                    onClick={() => navigate(`/edit-book/${b.id}`)}
                  >
                    ✏️
                  </button>

                  <button className="btn-icon delete">
                    🗑️
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Books;