import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Forms.css';

function AddReading() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);

  const [formData, setFormData] = useState({
    book_id: '',
    date: new Date().toISOString().split('T')[0],
    pages_read: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const [selectedBook, setSelectedBook] =
    useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const activeBooks =
        await window.electronAPI.books.getActive();

      setBooks(activeBooks);

      if (
        activeBooks.length > 0 &&
        !formData.book_id
      ) {
        handleBookSelect(activeBooks[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookSelect = async (bookId) => {
    setFormData((prev) => ({
      ...prev,
      book_id: bookId
    }));

    try {
      const book =
        await window.electronAPI.books.getById(
          bookId
        );

      setSelectedBook(book);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.book_id ||
      Number(formData.pages_read) < 1
    ) {
      return;
    }

    setLoading(true);

    try {
      await window.electronAPI.sessions.create({
        book_id: Number(formData.book_id),
        date: formData.date,
        pages_read: Number(formData.pages_read),
        notes: formData.notes || null
      });

      navigate('/');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getNewProgress = () => {
    if (
      !selectedBook ||
      Number(formData.pages_read) <= 0
    ) {
      return null;
    }

    const newCurrent =
      selectedBook.current_page +
      Number(formData.pages_read);

    const percentage = Math.round(
      (newCurrent /
        selectedBook.total_pages) *
        100
    );

    return {
      current: newCurrent,
      percentage
    };
  };

  const progress = getNewProgress();

  if (books.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>📚 Kitap yok</h2>

          <button
            onClick={() =>
              navigate('/add-book')
            }
            className="btn btn-primary"
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
        <h1>📖 Okuma Kaydı Ekle</h1>
      </div>

      <div className="form-container">

        <form
          onSubmit={handleSubmit}
          className="reading-form"
        >

          <div className="form-group">
            <label>Kitap</label>

            <select
              value={formData.book_id}
              onChange={(e) =>
                handleBookSelect(e.target.value)
              }
            >
              <option value="">Seç</option>

              {books.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                >
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tarih</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Sayfa</label>

            <input
              type="number"
              name="pages_read"
              min="1"
              value={formData.pages_read}
              onChange={handleChange}
              placeholder="Kaç sayfa okudun?"
            />
          </div>

          {progress && (
            <div className="progress-info">

              <p className="progress-label">
                Yeni ilerleme:

                <span className="highlight">
                  {' '}
                  {progress.current} /{' '}
                  {selectedBook.total_pages}
                </span>
              </p>

              <div className="progress-bar-large">

                <div
                  className="progress-fill-large"
                  style={{
                    width: `${Math.min(
                      progress.percentage,
                      100
                    )}%`,

                    background:
                      progress.percentage >= 100
                        ? 'linear-gradient(90deg,#2ecc71,#27ae60)'
                        : 'linear-gradient(90deg,#3498db,#2980b9)'
                  }}
                />

              </div>

              <p className="progress-percent">
                %{progress.percentage}
              </p>

              {progress.percentage >= 100 && (
                <div className="completion-badge">
                  🎉 Tebrikler! Bu kayıtla kitabı tamamlayacaksın!
                </div>
              )}

            </div>
          )}

          <div className="form-group">
            <label>Not</label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Bugünkü okumayla ilgili not..."
            />
          </div>

          <button
            disabled={loading}
            className="btn btn-primary"
          >
            {loading
              ? 'Kaydediliyor...'
              : 'Kaydet'}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddReading;