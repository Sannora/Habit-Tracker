import { useState, useEffect } from 'react';
import Calendar from '../Calendar/Calendar';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalPages: 0,
    dailyAverage: 0,
    activeBooks: 0,
    totalBooks: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [totalPages, dailyAvg, allBooks, activeBooks, sessions, userData] = await Promise.all([
        window.electronAPI.stats.getTotalPages(),
        window.electronAPI.stats.getDailyAverage(),
        window.electronAPI.books.getAll(),
        window.electronAPI.books.getActive(),
        window.electronAPI.sessions.getAll(),
        window.electronAPI.user.get()
      ]);

      setStats({
        totalPages,
        dailyAverage: dailyAvg,
        activeBooks: activeBooks.length,
        totalBooks: allBooks.length
      });

      setRecentSessions(sessions.slice(0, 5));
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Dashboard yüklenirken hata:', error);
      setLoading(false);
    }
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
        <h1>📊 Dashboard</h1>
        <p>Okuma alışkanlıklarına genel bakış</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalPages}</h3>
            <p>Toplam Sayfa</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <h3>{stats.activeBooks}</h3>
            <p>Aktif Kitap</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.dailyAverage}</h3>
            <p>Günlük Ortalama</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h3>{stats.totalBooks}</h3>
            <p>Toplam Kitap</p>
          </div>
        </div>
      </div>

      {/* TAKVİM - YENİ! */}
      <div style={{ marginBottom: '40px' }}>
        <Calendar dailyGoal={user?.daily_goal || 50} />
      </div>

      {/* Son Okuma Kayıtları */}
      <div className="recent-section">
        <h2>📝 Son Okuma Kayıtları</h2>
        {recentSessions.length === 0 ? (
          <div className="empty-state">
            <p>Henüz okuma kaydı yok</p>
            <p className="subtitle">Okuma ekle sayfasından ilk kaydını oluştur!</p>
          </div>
        ) : (
          <div className="sessions-list">
            {recentSessions.map(session => (
              <div key={session.id} className="session-item">
                <div className="session-date">
                  {new Date(session.date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="session-details">
                  <h4>{session.book_title || 'Bilinmeyen Kitap'}</h4>
                  <p>{session.pages_read} sayfa okundu</p>
                </div>
                <div className="session-pages">
                  {session.pages_read}
                  <span>sayfa</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;