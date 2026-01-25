import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import './Stats.css';

function Stats() {
  const [stats, setStats] = useState({
    totalPages: 0,
    dailyAverage: 0,
    totalBooks: 0,
    completedBooks: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [chartData, setChartData] = useState([]);
  const [bookStats, setBookStats] = useState([]);
  const [timeRange, setTimeRange] = useState(30); // 7, 30, 90 gün
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Temel istatistikler
      const [totalPages, dailyAvg, allBooks, sessions] = await Promise.all([
        window.electronAPI.stats.getTotalPages(),
        window.electronAPI.stats.getDailyAverage(),
        window.electronAPI.books.getAll(),
        window.electronAPI.sessions.getAll()
      ]);

      const completedBooks = allBooks.filter(b => b.status === 'completed').length;

      // Streak hesaplama
      const streaks = calculateStreaks(sessions);

      setStats({
        totalPages,
        dailyAverage: dailyAvg,
        totalBooks: allBooks.length,
        completedBooks,
        currentStreak: streaks.current,
        longestStreak: streaks.longest
      });

      // Grafik verisi oluştur
      const chartData = generateChartData(sessions, timeRange);
      setChartData(chartData);

      // Kitap bazlı istatistikler
      const bookStatsData = generateBookStats(allBooks, sessions);
      setBookStats(bookStatsData);

      setLoading(false);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      setLoading(false);
    }
  };

// Streak (ardışık gün) hesaplama - DÜZELTİLMİŞ VERSİYON
const calculateStreaks = (sessions) => {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  // Benzersiz günleri al ve sırala (eskiden yeniye)
  const uniqueDays = [...new Set(sessions.map(s => s.date))].sort();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Bugün veya dün okuma var mı kontrol et
  const hasToday = uniqueDays.includes(today);
  const hasYesterday = uniqueDays.includes(yesterday);

  if (!hasToday && !hasYesterday) {
    // Bugün ve dün okuma yok, streak kırılmış
    currentStreak = 0;
  } else {
    // Bugünden geriye doğru kontrol et
    let checkDate = hasToday ? new Date() : subDays(new Date(), 1);
    currentStreak = 1;

    for (let i = 1; i < uniqueDays.length; i++) {
      const previousDay = format(subDays(checkDate, i), 'yyyy-MM-dd');
      
      if (uniqueDays.includes(previousDay)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // En uzun seriyi hesapla
  for (let i = 1; i < uniqueDays.length; i++) {
    const currentDay = new Date(uniqueDays[i]);
    const prevDay = new Date(uniqueDays[i - 1]);
    const diffDays = Math.floor((currentDay - prevDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
};

  // Grafik verisi oluştur
  const generateChartData = (sessions, days) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTotal = sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.pages_read, 0);

      return {
        date: format(date, 'd MMM', { locale: tr }),
        pages: dayTotal,
        fullDate: dateStr
      };
    });
  };

  // Kitap bazlı istatistikler
  const generateBookStats = (books, sessions) => {
    return books.map(book => {
      const bookSessions = sessions.filter(s => s.book_id === book.id);
      const totalPages = bookSessions.reduce((sum, s) => sum + s.pages_read, 0);
      
      return {
        name: book.title,
        pages: totalPages,
        color: book.cover_color,
        progress: Math.round((book.current_page / book.total_pages) * 100)
      };
    }).sort((a, b) => b.pages - a.pages).slice(0, 5); // Top 5 kitap
  };

  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];

  if (loading) {
    return (
      <div className="page">
        <div className="loading">İstatistikler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📈 İstatistikler</h1>
        <p>Okuma performansın ve ilerleme grafikler</p>
      </div>

      {/* Temel İstatistikler */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalPages}</h3>
            <p>Toplam Okunan Sayfa</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.dailyAverage}</h3>
            <p>Günlük Ortalama</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <h3>{stats.currentStreak}</h3>
            <p>Güncel Seri (Gün)</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>{stats.longestStreak}</h3>
            <p>En Uzun Seri (Gün)</p>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>{stats.completedBooks}</h3>
            <p>Tamamlanan Kitap</p>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <h3>{stats.totalBooks}</h3>
            <p>Toplam Kitap</p>
          </div>
        </div>
      </div>

      {/* Zaman Aralığı Seçici */}
      <div className="time-range-selector">
        <button 
          className={timeRange === 7 ? 'active' : ''}
          onClick={() => setTimeRange(7)}
        >
          Son 7 Gün
        </button>
        <button 
          className={timeRange === 30 ? 'active' : ''}
          onClick={() => setTimeRange(30)}
        >
          Son 30 Gün
        </button>
        <button 
          className={timeRange === 90 ? 'active' : ''}
          onClick={() => setTimeRange(90)}
        >
          Son 90 Gün
        </button>
      </div>

      {/* Günlük Sayfa Grafiği (Line Chart) */}
      <div className="chart-container">
        <h3 className="chart-title">📈 Günlük Okuma Grafiği</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
            <XAxis 
              dataKey="date" 
              stroke="#7f8c8d"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#7f8c8d"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '2px solid #ecf0f1',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="pages" 
              stroke="#3498db" 
              strokeWidth={3}
              name="Okunan Sayfa"
              dot={{ fill: '#3498db', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="chart-container">
        <h3 className="chart-title">📊 Günlük Sayfa Dağılımı</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
            <XAxis 
              dataKey="date" 
              stroke="#7f8c8d"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#7f8c8d"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '2px solid #ecf0f1',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="pages" 
              fill="#2ecc71" 
              name="Okunan Sayfa"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Kitap Bazlı İstatistikler */}
      {bookStats.length > 0 && (
        <div className="two-column-grid">
          {/* Pie Chart */}
          <div className="chart-container">
            <h3 className="chart-title">📚 En Çok Okunan Kitaplar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.substring(0, 15)}... ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="pages"
                >
                  {bookStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Kitap Listesi */}
          <div className="chart-container">
            <h3 className="chart-title">🏆 Top 5 Kitap</h3>
            <div className="book-stats-list">
              {bookStats.map((book, index) => (
                <div key={index} className="book-stat-item">
                  <div className="book-rank">{index + 1}</div>
                  <div className="book-stat-bar-container">
                    <div className="book-stat-name">{book.name}</div>
                    <div className="book-stat-bar">
                      <div 
                        className="book-stat-fill"
                        style={{ 
                          width: `${book.progress}%`,
                          background: book.color 
                        }}
                      ></div>
                    </div>
                    <div className="book-stat-pages">{book.pages} sayfa</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Motivasyon Mesajları */}
      <div className="motivation-box">
        {stats.currentStreak > 0 ? (
          <>
            <h3>🔥 Harika gidiyorsun!</h3>
            <p>
              {stats.currentStreak} gündür kesintisiz okuyorsun! 
              {stats.currentStreak >= 7 && " Muhteşem bir seri! "}
              {stats.currentStreak >= 30 && " İnanılmaz bir disiplin! "}
              Böyle devam et! 💪
            </p>
          </>
        ) : (
          <>
            <h3>📚 Okumaya başla!</h3>
            <p>Bugün bir kitap açıp birkaç sayfa oku ve serini başlat! 🚀</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Stats;