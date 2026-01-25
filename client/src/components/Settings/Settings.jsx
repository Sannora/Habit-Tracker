import { useState, useEffect } from 'react';
import './Settings.css';

function Settings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    daily_goal: 50,
    theme: 'light'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [importStatus, setImportStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userData = await window.electronAPI.user.get();
      setUser(userData);
      setFormData({
        name: userData.name,
        daily_goal: userData.daily_goal,
        theme: userData.theme
      });
      setLoading(false);
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
      setLoading(false);
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

    if (!formData.name.trim()) {
      alert('Lütfen bir isim girin!');
      return;
    }

    if (formData.daily_goal < 1) {
      alert('Günlük hedef en az 1 sayfa olmalıdır!');
      return;
    }

    setSaving(true);

    try {
      await window.electronAPI.user.update({
        name: formData.name.trim(),
        daily_goal: parseInt(formData.daily_goal),
        theme: formData.theme
      });

      // Tema değişikliği varsa uygula
      if (formData.theme !== user.theme) {
        document.documentElement.setAttribute('data-theme', formData.theme);
      }

      alert('Ayarlar başarıyla kaydedildi!');
      setSaving(false);
      loadSettings();
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      alert('Ayarlar kaydedilirken bir hata oluştu!');
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExportStatus('Dışa aktarılıyor...');
    
    try {
      const result = await window.electronAPI.data.export();
      
      if (result.success) {
        setExportStatus(`✓ Veriler başarıyla dışa aktarıldı: ${result.path}`);
        setTimeout(() => setExportStatus(''), 5000);
      } else {
        setExportStatus('✗ Dışa aktarma sırasında bir hata oluştu!');
      }
    } catch (error) {
      console.error('Export hatası:', error);
      setExportStatus('✗ Dışa aktarma sırasında bir hata oluştu!');
    }
  };

  const handleImport = async () => {
    if (!confirm('Mevcut veriler silinecek ve yeni veriler içe aktarılacak. Devam etmek istediğinize emin misiniz?')) {
      return;
    }

    setImportStatus('İçe aktarılıyor...');
    
    try {
      const result = await window.electronAPI.data.import();
      
      if (result.success) {
        setImportStatus(`✓ ${result.imported} kayıt başarıyla içe aktarıldı!`);
        setTimeout(() => {
          setImportStatus('');
          window.location.reload(); // Sayfayı yenile
        }, 2000);
      } else if (result.cancelled) {
        setImportStatus('İptal edildi');
        setTimeout(() => setImportStatus(''), 2000);
      } else {
        setImportStatus('✗ İçe aktarma sırasında bir hata oluştu!');
      }
    } catch (error) {
      console.error('Import hatası:', error);
      setImportStatus('✗ İçe aktarma sırasında bir hata oluştu!');
    }
  };

  const handleReset = async () => {
    const confirmText = prompt(
      'TÜM VERİLERİ SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\n' +
      'Bu işlem GERİ ALINAMAZ!\n\n' +
      'Devam etmek için "SIFIRLA" yazın:'
    );

    if (confirmText !== 'SIFIRLA') {
      alert('İşlem iptal edildi');
      return;
    }

    try {
      await window.electronAPI.data.reset();
      alert('Tüm veriler silindi. Uygulama yeniden başlatılacak.');
      window.location.reload();
    } catch (error) {
      console.error('Reset hatası:', error);
      alert('Veriler silinirken bir hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Ayarlar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>⚙️ Ayarlar</h1>
        <p>Uygulama tercihlerini yönet</p>
      </div>

      <div className="settings-container">
        {/* Kullanıcı Ayarları */}
        <div className="settings-section">
          <h2>👤 Kullanıcı Bilgileri</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">İsim</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınız"
              />
            </div>

            <div className="form-group">
              <label htmlFor="daily_goal">Günlük Hedef (Sayfa)</label>
              <input
                type="number"
                id="daily_goal"
                name="daily_goal"
                value={formData.daily_goal}
                onChange={handleChange}
                min="1"
              />
              <p className="help-text">
                Takvim renklendirmesi bu hedefe göre yapılır
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="theme">Tema</label>
              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
              >
                <option value="light">☀️ Açık Tema</option>
                <option value="dark">🌙 Koyu Tema</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : '✓ Ayarları Kaydet'}
            </button>
          </form>
        </div>

        {/* Veri Yönetimi */}
        <div className="settings-section">
          <h2>💾 Veri Yönetimi</h2>
          
          <div className="data-actions">
            <div className="data-action-item">
              <div>
                <h3>📤 Dışa Aktar</h3>
                <p>Tüm verilerinizi JSON dosyası olarak kaydedin</p>
              </div>
              <button onClick={handleExport} className="btn btn-secondary">
                Dışa Aktar
              </button>
            </div>
            {exportStatus && (
              <div className={`status-message ${exportStatus.includes('✓') ? 'success' : 'error'}`}>
                {exportStatus}
              </div>
            )}

            <div className="data-action-item">
              <div>
                <h3>📥 İçe Aktar</h3>
                <p>Daha önce dışa aktardığınız verileri geri yükleyin</p>
              </div>
              <button onClick={handleImport} className="btn btn-secondary">
                İçe Aktar
              </button>
            </div>
            {importStatus && (
              <div className={`status-message ${importStatus.includes('✓') ? 'success' : 'error'}`}>
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Tehlikeli Bölge */}
        <div className="settings-section danger-zone">
          <h2>⚠️ Tehlikeli Bölge</h2>
          
          <div className="data-actions">
            <div className="data-action-item">
              <div>
                <h3>🗑️ Tüm Verileri Sil</h3>
                <p className="danger-text">
                  Bu işlem GERİ ALINAMAZ! Tüm kitaplar, okuma kayıtları ve ayarlar silinecektir.
                </p>
              </div>
              <button onClick={handleReset} className="btn btn-danger">
                Verileri Sıfırla
              </button>
            </div>
          </div>
        </div>

        {/* Uygulama Bilgisi */}
        <div className="settings-section app-info">
          <h2>ℹ️ Uygulama Bilgisi</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Versiyon</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Platform</span>
              <span className="info-value">{window.electronAPI?.platform || 'Web'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;