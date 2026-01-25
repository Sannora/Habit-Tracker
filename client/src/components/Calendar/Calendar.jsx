import { useState, useEffect } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay,
  isToday,
  isFuture,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { tr } from 'date-fns/locale';
import './Calendar.css';

function Calendar({ dailyGoal = 50 }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [readingSessions, setReadingSessions] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [currentMonth]);

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const sessions = await window.electronAPI.sessions.getByDateRange(start, end);
      setReadingSessions(sessions);
      setLoading(false);
    } catch (error) {
      console.error('Takvim verileri yüklenirken hata:', error);
      setLoading(false);
    }
  };

  // Bir gün için toplam sayfa sayısını hesapla
  const getPagesForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return readingSessions
      .filter(session => session.date === dayStr)
      .reduce((sum, session) => sum + session.pages_read, 0);
  };

  // Sayfa sayısına göre renk hesapla (gradyan)
  const getColorForPages = (pages) => {
    if (pages === 0) return '#f0f0f0'; // Hiç okumamış (açık gri)
    
    const ratio = pages / dailyGoal;
    
    if (ratio < 0.25) return '#ffedcc'; // Çok az (çok açık turuncu)
    if (ratio < 0.5) return '#ffd89b';  // Az (açık turuncu)
    if (ratio < 0.75) return '#ffaa5c'; // Orta (orta turuncu)
    if (ratio < 1) return '#ff8c42';    // İyi (koyu turuncu)
    if (ratio < 1.5) return '#ff6b35';  // Hedefi geçmiş (daha koyu)
    return '#e63946';                    // Süper (en koyu kırmızı)
  };

  // Takvim günlerini oluştur (haftanın başından sonuna kadar)
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Pazartesi başlangıç
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const days = getCalendarDays();
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const handleDayClick = (day) => {
    if (isFuture(day)) return; // Gelecek günlere tıklanamaz
    
    const pages = getPagesForDay(day);
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySessions = readingSessions.filter(s => s.date === dayStr);
    
    setSelectedDay({
      date: day,
      pages,
      sessions: daySessions
    });
  };

  const closeModal = () => {
    setSelectedDay(null);
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleEditSession = (session) => {
    setEditingSession({
      id: session.id,
      pages_read: session.pages_read,
      notes: session.notes || '',
      date: session.date
    });
  };

  const handleUpdateSession = async () => {
    if (!editingSession.pages_read || editingSession.pages_read < 1) {
      alert('Lütfen geçerli bir sayfa sayısı girin!');
      return;
    }

    try {
      await window.electronAPI.sessions.update(editingSession.id, {
        pages_read: parseInt(editingSession.pages_read),
        notes: editingSession.notes.trim() || null,
        date: editingSession.date
      });

      setEditingSession(null);
      loadMonthData(); // Takvimi yenile
      
      // Seçili günü güncelle
      if (selectedDay) {
        const dayStr = format(selectedDay.date, 'yyyy-MM-dd');
        const sessions = await window.electronAPI.sessions.getByDateRange(dayStr, dayStr);
        const pages = sessions.reduce((sum, s) => sum + s.pages_read, 0);
        
        setSelectedDay({
          ...selectedDay,
          pages,
          sessions
        });
      }
    } catch (error) {
      console.error('Okuma kaydı güncellenirken hata:', error);
      alert('Güncelleme sırasında bir hata oluştu!');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Bu okuma kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await window.electronAPI.sessions.delete(sessionId);
      loadMonthData();
      
      // Seçili günü güncelle
      if (selectedDay) {
        const updatedSessions = selectedDay.sessions.filter(s => s.id !== sessionId);
        const pages = updatedSessions.reduce((sum, s) => sum + s.pages_read, 0);
        
        if (updatedSessions.length === 0) {
          setSelectedDay(null);
        } else {
          setSelectedDay({
            ...selectedDay,
            pages,
            sessions: updatedSessions
          });
        }
      }
    } catch (error) {
      console.error('Okuma kaydı silinirken hata:', error);
      alert('Silme sırasında bir hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="calendar-loading">Takvim yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {/* Takvim Header */}
      <div className="calendar-header">
        <button onClick={previousMonth} className="month-nav">←</button>
        <div className="month-title">
          <h2>{format(currentMonth, 'MMMM yyyy', { locale: tr })}</h2>
          <button onClick={goToToday} className="today-btn">Bugün</button>
        </div>
        <button onClick={nextMonth} className="month-nav">→</button>
      </div>

      {/* Hafta Günleri */}
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday-label">{day}</div>
        ))}
      </div>

      {/* Takvim Grid */}
      <div className="calendar-grid">
        {days.map(day => {
          const pages = getPagesForDay(day);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isTodayDay = isToday(day);
          const isFutureDay = isFuture(day);
          
          return (
            <div
              key={day.toString()}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDay ? 'today' : ''} ${isFutureDay ? 'future' : ''}`}
              style={{
                background: isCurrentMonth && !isFutureDay ? getColorForPages(pages) : '#fafafa',
                cursor: !isFutureDay && isCurrentMonth ? 'pointer' : 'default'
              }}
              onClick={() => isCurrentMonth && handleDayClick(day)}
              title={`${format(day, 'd MMMM', { locale: tr })}: ${pages} sayfa`}
            >
              <span className="day-number">{format(day, 'd')}</span>
              {pages > 0 && isCurrentMonth && (
                <span className="day-pages">{pages}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Renk Lejantı */}
      <div className="calendar-legend">
        <span className="legend-label">Daha az</span>
        <div className="legend-colors">
          <div className="legend-box" style={{ background: '#f0f0f0' }} title="0 sayfa"></div>
          <div className="legend-box" style={{ background: '#ffedcc' }} title="1-12 sayfa"></div>
          <div className="legend-box" style={{ background: '#ffd89b' }} title="13-24 sayfa"></div>
          <div className="legend-box" style={{ background: '#ffaa5c' }} title="25-37 sayfa"></div>
          <div className="legend-box" style={{ background: '#ff8c42' }} title="38-49 sayfa"></div>
          <div className="legend-box" style={{ background: '#ff6b35' }} title="50-74 sayfa"></div>
          <div className="legend-box" style={{ background: '#e63946' }} title="75+ sayfa"></div>
        </div>
        <span className="legend-label">Daha çok</span>
      </div>

      {/* Gün Detay Modal */}
      {selectedDay && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{format(selectedDay.date, 'd MMMM yyyy, EEEE', { locale: tr })}</h3>
              <button onClick={closeModal} className="modal-close">✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-summary">
                <div className="summary-item">
                  <span className="summary-icon">📖</span>
                  <div>
                    <p className="summary-value">{selectedDay.pages}</p>
                    <p className="summary-label">Toplam Sayfa</p>
                  </div>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">📚</span>
                  <div>
                    <p className="summary-value">{selectedDay.sessions.length}</p>
                    <p className="summary-label">Okuma Sayısı</p>
                  </div>
                </div>
              </div>

              {selectedDay.sessions.length > 0 ? (
                <div className="sessions-detail">
                  <h4>Okuma Detayları</h4>
                  {selectedDay.sessions.map(session => (
                    <div key={session.id} className="session-detail-item">
                      <div className="session-book-info">
                        <span className="book-dot" style={{ background: session.cover_color }}></span>
                        <span className="book-name">{session.book_title}</span>
                      </div>
                      <div className="session-info-row">
                        <span className="session-pages-detail">{session.pages_read} sayfa</span>
                        <div className="session-actions">
                          <button 
                            onClick={() => handleEditSession(session)}
                            className="session-action-btn edit"
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteSession(session.id)}
                            className="session-action-btn delete"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {session.notes && (
                        <p className="session-notes">"{session.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-sessions">
                  <p>Bu gün için okuma kaydı yok</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme Modal - YENİ! */}
      {editingSession && (
        <div className="modal-overlay" onClick={() => setEditingSession(null)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Okuma Kaydını Düzenle</h3>
              <button onClick={() => setEditingSession(null)} className="modal-close">✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-pages">Sayfa Sayısı</label>
                <input
                  type="number"
                  id="edit-pages"
                  value={editingSession.pages_read}
                  onChange={(e) => setEditingSession({
                    ...editingSession,
                    pages_read: e.target.value
                  })}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-notes">Notlar</label>
                <textarea
                  id="edit-notes"
                  value={editingSession.notes}
                  onChange={(e) => setEditingSession({
                    ...editingSession,
                    notes: e.target.value
                  })}
                  rows="4"
                  placeholder="Notlarınızı buraya yazın..."
                />
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => setEditingSession(null)}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button 
                  onClick={handleUpdateSession}
                  className="btn btn-primary"
                >
                  ✓ Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;