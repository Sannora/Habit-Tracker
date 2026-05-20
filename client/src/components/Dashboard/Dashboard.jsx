import { useEffect } from 'react';
import {
  useBooksStore,
  useSessionsStore,
  useUserStore,
  useStatsStore
} from '../../store';

import useXpStore from '../../store/useXpStore';

import Calendar from '../Calendar/Calendar';
import './Dashboard.css';

function Dashboard() {
  const fetchBooks = useBooksStore((s) => s.fetchBooks);
  const fetchSessions = useSessionsStore((s) => s.fetchSessions);
  const fetchUser = useUserStore((s) => s.fetchUser);

  const user = useUserStore((s) => s.user);

  const getMonthlyTotalPages =
    useStatsStore((s) => s.getMonthlyTotalPages);
  
  const getMonthlyDailyAverage =
    useStatsStore((s) => s.getMonthlyDailyAverage);
  
  const getMonthlyActiveBooksCount =
    useStatsStore((s) => s.getMonthlyActiveBooksCount);
  
  const getMonthlyTotalBooksCount =
    useStatsStore((s) => s.getMonthlyTotalBooksCount);
  
  const getRecentSessions =
    useStatsStore((s) => s.getRecentSessions);

  const getLevelData = useXpStore((s) => s.getLevelData);
  const xpData = getLevelData();

  useEffect(() => {
    fetchBooks();
    fetchSessions();
    fetchUser();
  }, []);

  const booksLoading = useBooksStore((s) => s.loading);
  const sessionsLoading = useSessionsStore((s) => s.loading);
  const userLoading = useUserStore((s) => s.loading);

  if (booksLoading || sessionsLoading || userLoading) {
    return (
      <div className="page">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  const totalPages = getMonthlyTotalPages();
  const dailyAverage = getMonthlyDailyAverage();
  const activeBooks = getMonthlyActiveBooksCount();
  const totalBooks = getMonthlyTotalBooksCount();
  const recentSessions = getRecentSessions();

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-header">
        <h1>📊 Genel Görünüm</h1>
        <p>Okuma alışkanlıklarına genel bakış</p>
      </div>

      {/* LEVEL BAR */}
        
      <div className="level-container">

        <div className="level-circle current">
          {xpData.level}
        </div>

        <div className="level-progress-wrapper">

          <div className="level-progress-top">

            <span className="level-label">
              Seviye {xpData.level}
            </span>

            <span className="level-xp">
              {xpData.currentXP} Okur Puanı
            </span>

          </div>

          <div className="level-progress">
            <div
              className="level-fill"
              style={{
                width: `${xpData.progress}%`
              }}
            />
          </div>
            
          <div className="level-progress-text">
            Sonraki seviye için{' '}
            <strong>
              {xpData.nextLevelXP - xpData.currentXP} Okur Puanı
            </strong>
            {' '}kaldı
          </div>
            
        </div>
            
        <div className="level-circle next">
          {xpData.level + 1}
        </div>
            
      </div>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card blue">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{totalPages}</h3>
            <p>Toplam Sayfa</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <h3>{activeBooks}</h3>
            <p>Aktif Kitap</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{dailyAverage}</h3>
            <p>Günlük Ortalama</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h3>{totalBooks}</h3>
            <p>Toplam Kitap</p>
          </div>
        </div>

      </div>

      {/* CALENDAR */}
      <div style={{ marginBottom: '40px' }}>
        <Calendar dailyGoal={user?.daily_goal || 50} />
      </div>

      {/* RECENT SESSIONS */}
      <div className="recent-section">
        <h2>📝 Son Okuma Kayıtları</h2>

        {recentSessions.length === 0 ? (
          <div className="empty-state">
            <p>Henüz okuma kaydı yok</p>
            <p className="subtitle">
              Okuma ekle sayfasından ilk kaydını oluştur!
            </p>
          </div>
        ) : (
          <div className="sessions-list">
            {recentSessions.map((session) => (
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