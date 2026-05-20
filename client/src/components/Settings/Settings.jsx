import { useState } from 'react';
import { useUserStore } from '../../store';
import './Settings.css';

function Settings() {
  const { user, updateUser } = useUserStore();

  const [name, setName] = useState(user?.name || '');
  const [goal, setGoal] = useState(user?.daily_goal || 50);
  const [theme, setTheme] = useState(user?.theme || 'light');

  const [status, setStatus] = useState(null);

  const handleSave = () => {
    updateUser({ name, daily_goal: goal, theme });
    document.documentElement.setAttribute('data-theme', theme);
    setStatus('success');
    setTimeout(() => setStatus(null), 2000);
  };

  const exportData = () => {
    const data = localStorage;
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup.json';
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const data = JSON.parse(reader.result);
      Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
      window.location.reload();
    };

    reader.readAsText(file);
  };

  const resetData = () => {
    if (confirm('Tüm veriler silinecek, emin misin?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="page settings-container">

      {/* === PROFILE === */}
      <div className="settings-section">
        <h2>👤 Profil</h2>

        <div className="form-group">
          <label>İsim</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Günlük Hedef</label>
          <input
            type="number"
            value={goal}
            onChange={e => setGoal(Number(e.target.value))}
          />
        </div>

        <button className="btn" onClick={handleSave}>Kaydet</button>

        {status && <div className="status-message success">Kaydedildi</div>}
      </div>

      {/* === THEME === */}
      <div className="settings-section">
        <h2>🎨 Tema</h2>

        <div className="form-group">
          <label>Tema seç</label>
          <select value={theme} onChange={e => setTheme(e.target.value)}>
            <option value="light">Açık</option>
            <option value="dark">Koyu</option>
          </select>
          <p className="help-text">Uygulamanın görünümünü değiştirir</p>
        </div>
      </div>

      {/* === DATA === */}
      <div className="settings-section">
        <h2>💾 Veri Yönetimi</h2>

        <div className="data-actions">

          <div className="data-action-item">
            <div>
              <h3>Dışa Aktar</h3>
              <p>Tüm verilerini yedek olarak indir</p>
            </div>
            <button className="btn" onClick={exportData}>İndir</button>
          </div>

          <div className="data-action-item">
            <div>
              <h3>İçe Aktar</h3>
              <p>Yedek dosyadan verileri geri yükle</p>
            </div>
            <input type="file" onChange={importData} />
          </div>

        </div>
      </div>

      {/* === DANGER === */}
      <div className="settings-section danger-zone">
        <h2>⚠️ Tehlikeli Bölge</h2>

        <p className="danger-text">
          Tüm verilerini kalıcı olarak siler.
        </p>

        <button className="btn-danger" onClick={resetData}>
          Verileri Sıfırla
        </button>
      </div>

      {/* === APP INFO === */}
      <div className="settings-section app-info">
        <h2>ℹ️ Uygulama Bilgisi</h2>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Versiyon</span>
            <span className="info-value">1.0.1</span>
          </div>

          <div className="info-item">
            <span className="info-label">Platform</span>
            <span className="info-value">Web</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Settings;