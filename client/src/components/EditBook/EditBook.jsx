import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/Forms.css';

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    total_pages: '',
    current_page: '',
    status: 'reading',
    cover_color: '#4A90E2'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      const book = await window.electronAPI.books.getById(parseInt(id));
      if (book) {
        setFormData({
          title: book.title,
          author: book.author || '',
          total_pages: book.total_pages,
          current_page: book.current_page,
          status: book.status,
          cover_color: book.cover_color
        });
      } else {
        alert('Kitap bulunamadı!');
        navigate('/books');
      }
      setLoading(false);
    } catch (error) {
      console.error('Kitap yüklenirken hata:', error);
      alert('Kitap yüklenemedi!');
      navigate('/books');
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
    
    // Validasyon
    if (!formData.title.trim()) {
      alert('Lütfen kitap adını girin!');
      return;
    }
    
    if (!formData.total_pages || formData.total_pages < 1) {
      alert('Lütfen geçerli bir sayfa sayısı girin!');
      return;
    }

    // Current page total pages'i geçemez
    if (parseInt(formData.current_page) > parseInt(formData.total_pages)) {
      alert('Mevcut sayfa, toplam sayfa sayısından büyük olamaz!');
      return;
    }

    setSaving(true);

    try {
      await window.electronAPI.books.update(parseInt(id), {
        title: formData.title.trim(),
        author: formData.author.trim() || null,
        total_pages: parseInt(formData.total_pages),
        current_page: parseInt(formData.current_page),
        status: formData.status,
        cover_color: formData.cover_color
      });

      navigate('/books');
    } catch (error) {
      console.error('Kitap güncellenirken hata:', error);
      alert('Kitap güncellenirken bir hata oluştu!');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Kitap yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>✏️ Kitabı Düzenle</h1>
          <p>Kitap bilgilerini güncelle</p>
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

          {/* Yazar */}
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

          {/* Durum */}
          <div className="form-group">
            <label htmlFor="status">Durum</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="reading">Okunuyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="paused">Duraklatıldı</option>
            </select>
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
                <p className="preview-status">
                  {formData.status === 'reading' && '📖 Okunuyor'}
                  {formData.status === 'completed' && '✓ Tamamlandı'}
                  {formData.status === 'paused' && '⏸ Duraklatıldı'}
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
              disabled={saving}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : '✓ Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBook;