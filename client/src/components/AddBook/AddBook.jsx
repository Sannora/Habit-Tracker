import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Forms.css'

function AddBook() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    total_pages: '',
    current_page: '0',
    cover_color: '#4A90E2',
    rating: 0
  });
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    '#4A90E2', // Mavi
    '#E74C3C', // Kırmızı
    '#2ECC71', // Yeşil
    '#F39C12', // Turuncu
    '#9B59B6', // Mor
    '#1ABC9C', // Turkuaz
    '#E67E22', // Koyu Turuncu
    '#34495E', // Koyu Gri
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Lütfen kitap adını girin!');
      return;
    }
    
    if (!formData.total_pages || formData.total_pages < 1) {
      alert('Lütfen geçerli bir sayfa sayısı girin!');
      return;
    }

    setLoading(true);

    try {
      await window.electronAPI.books.create({
        title: formData.title.trim(),
        author: formData.author.trim() || null,
        total_pages: parseInt(formData.total_pages),
        current_page: parseInt(formData.current_page) || 0,
        cover_color: formData.cover_color,
        status: 'reading',
        start_date: new Date().toISOString().split('T')[0]
      });

      navigate('/books');
    } catch (error) {
      console.error('Kitap eklenirken hata:', error);
      alert('Kitap eklenirken bir hata oluştu!');
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>➕ Yeni Kitap Ekle</h1>
          <p>Okumaya başladığın yeni bir kitap ekle</p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="book-form">
          {/* Kitap Adı */}
          <div className="form-group">
            <label htmlFor="title">Kitap Adı *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="örn: 1984"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Yazar</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="örn: George Orwell"
            />
          </div>

          {/* Sayfa Sayıları */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="total_pages">Toplam Sayfa *</label>
              <input
                type="number"
                id="total_pages"
                name="total_pages"
                value={formData.total_pages}
                onChange={handleChange}
                placeholder="300"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="current_page">Şu Anki Sayfa</label>
              <input
                type="number"
                id="current_page"
                name="current_page"
                value={formData.current_page}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Renk Seçimi */}
          <div className="form-group">
            <label>Kapak Rengi</label>
            <div className="color-picker">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.cover_color === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setFormData(prev => ({ ...prev, cover_color: color }))}
                  title={color}
                >
                  {formData.cover_color === color && '✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Önizleme */}
          <div className="book-preview">
            <p className="preview-label">Önizleme:</p>
            <div className="preview-card">
              <div 
                className="preview-cover" 
                style={{ background: formData.cover_color }}
              >
                <div className="preview-icon">📖</div>
              </div>
              <div className="preview-info">
                <h3>{formData.title || 'Kitap Adı'}</h3>
                <p>{formData.author || 'Yazar Adı'}</p>
                <p className="preview-pages">
                  {formData.current_page || 0} / {formData.total_pages || '?'} sayfa
                </p>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/books')}
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
              {loading ? 'Ekleniyor...' : '✓ Kitabı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBook;