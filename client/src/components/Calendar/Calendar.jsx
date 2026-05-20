import { useState, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isFuture,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

import './Calendar.css';

function Calendar({ dailyGoal = 50 }) {
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  // EDIT MODAL
  const [editingSession, setEditingSession] = useState(null);
  const [editPages, setEditPages] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const data = await window.electronAPI.sessions.getByDateRange(
      start,
      end
    );

    setSessions(data);
  };

  const getPages = (day) => {
    const d = format(day, 'yyyy-MM-dd');

    return sessions
      .filter((s) => s.date === d)
      .reduce((sum, s) => sum + s.pages_read, 0);
  };

  const getColor = (pages) => {
    if (pages === 0) return '#f0f0f0';

    const r = pages / dailyGoal;

    if (r < 0.25) return '#ffedcc';
    if (r < 0.5) return '#ffd89b';
    if (r < 0.75) return '#ffaa5c';
    if (r < 1) return '#ff8c42';
    if (r < 1.5) return '#ff6b35';

    return '#e63946';
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), {
      weekStartsOn: 1
    }),
    end: endOfWeek(endOfMonth(currentMonth), {
      weekStartsOn: 1
    })
  });

  const openDay = (day) => {
    if (isFuture(day)) return;

    const d = format(day, 'yyyy-MM-dd');

    const daySessions = sessions.filter((s) => s.date === d);

    setSelectedDay({
      date: day,
      sessions: daySessions,
      pages: getPages(day)
    });
  };

  const refreshSelectedDay = async (dateObj) => {
    const d = format(dateObj, 'yyyy-MM-dd');

    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const updatedSessions =
      await window.electronAPI.sessions.getByDateRange(
        start,
        end
      );

    setSessions(updatedSessions);

    const daySessions = updatedSessions.filter(
      (s) => s.date === d
    );

    setSelectedDay({
      date: dateObj,
      sessions: daySessions,
      pages: daySessions.reduce(
        (sum, s) => sum + s.pages_read,
        0
      )
    });
  };

  const handleDelete = async (id) => {
    await window.electronAPI.sessions.delete(id);

    await refreshSelectedDay(selectedDay.date);
  };

  const openEditModal = (session) => {
    setEditingSession(session);
    setEditPages(session.pages_read);
    setEditNotes(session.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;

    await window.electronAPI.sessions.update(
      editingSession.id,
      {
        ...editingSession,
        pages_read: Number(editPages),
        notes: editNotes
      }
    );

    setEditingSession(null);

    await refreshSelectedDay(selectedDay.date);
  };

  return (
    <div className="calendar-container">

      <div className="calendar-header">
        <button
          className="month-nav"
          onClick={() =>
            setCurrentMonth(
              subMonths(currentMonth, 1)
            )
          }
        >
          ←
        </button>

        <div className="month-title">
          <h2>
            {format(currentMonth, 'MMMM yyyy', {
              locale: tr
            })}
          </h2>

          <button
            className="today-btn"
            onClick={() =>
              setCurrentMonth(new Date())
            }
          >
            Bugün
          </button>
        </div>

        <button
          className="month-nav"
          onClick={() =>
            setCurrentMonth(
              addMonths(currentMonth, 1)
            )
          }
        >
          →
        </button>
      </div>

      <div className="calendar-weekdays">
        {[
          'Pzt',
          'Sal',
          'Çar',
          'Per',
          'Cum',
          'Cmt',
          'Paz'
        ].map((d) => (
          <div
            key={d}
            className="weekday-label"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const pages = getPages(day);

          const current =
            day.getMonth() ===
            currentMonth.getMonth();

          return (
            <div
              key={day}
              className={`calendar-day
                ${!current ? 'other-month' : ''}
                ${isToday(day) ? 'today' : ''}
                ${isFuture(day) ? 'future' : ''}
              `}
              style={{
                background:
                  current &&
                  !isFuture(day)
                    ? getColor(pages)
                    : undefined
              }}
              onClick={() =>
                current && openDay(day)
              }
            >
              <span className="day-number">
                {format(day, 'd')}
              </span>

              {pages > 0 && (
                <span className="day-pages">
                  {pages}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-label">
          Daha az
        </span>

        <div className="legend-colors">
          <div className="legend-box" style={{ background: '#f0f0f0' }} />
          <div className="legend-box" style={{ background: '#ffedcc' }} />
          <div className="legend-box" style={{ background: '#ffd89b' }} />
          <div className="legend-box" style={{ background: '#ffaa5c' }} />
          <div className="legend-box" style={{ background: '#ff8c42' }} />
          <div className="legend-box" style={{ background: '#ff6b35' }} />
          <div className="legend-box" style={{ background: '#e63946' }} />
        </div>

        <span className="legend-label">
          Daha çok
        </span>
      </div>

      {/* DAY MODAL */}
      {selectedDay && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedDay(null)
          }
        >
          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <h3>
                {format(
                  selectedDay.date,
                  'd MMMM yyyy, EEEE',
                  { locale: tr }
                )}
              </h3>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedDay(null)
                }
              >
                ✕
              </button>
            </div>

            <div className="modal-body">

              {selectedDay.sessions.length === 0 ? (
                <div className="no-sessions">
                  <p>Okuma yok</p>

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      navigate('/add-reading');
                    }}
                  >
                    + Okuma Ekle
                  </button>
                </div>
              ) : (
                <div className="sessions-detail">

                  {selectedDay.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="session-detail-item"
                    >
                      <div className="session-book-info">
                        <span
                          className="book-dot"
                          style={{
                            background:
                              s.cover_color
                          }}
                        />

                        <span className="book-name">
                          {s.book_title}
                        </span>
                      </div>

                      <div className="session-info-row">

                        <span className="session-pages-detail">
                          {s.pages_read} sayfa
                        </span>

                        <div className="session-actions">

                          <button
                            className="session-action-btn edit"
                            onClick={() =>
                              openEditModal(s)
                            }
                          >
                            ✏️
                          </button>

                          <button
                            className="session-action-btn delete"
                            onClick={() =>
                              handleDelete(s.id)
                            }
                          >
                            🗑️
                          </button>

                        </div>
                      </div>

                      {s.notes && (
                        <p className="session-notes">
                          {s.notes}
                        </p>
                      )}
                    </div>
                  ))}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingSession && (
        <div
          className="modal-overlay"
          onClick={() =>
            setEditingSession(null)
          }
        >
          <div
            className="modal-content edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <h3>Kayıdı Düzenle</h3>

              <button
                className="modal-close"
                onClick={() =>
                  setEditingSession(null)
                }
              >
                ✕
              </button>
            </div>

            <div className="modal-body">

              <div className="form-group">
                <label>Sayfa</label>

                <input
                  type="number"
                  value={editPages}
                  onChange={(e) =>
                    setEditPages(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Not</label>

                <textarea
                  rows="4"
                  value={editNotes}
                  onChange={(e) =>
                    setEditNotes(e.target.value)
                  }
                />
              </div>

              <div className="modal-actions">

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setEditingSession(null)
                  }
                >
                  İptal
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                >
                  Kaydet
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