import { useEffect, useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAppStore } from '../../store/useAppStore';
import './Stats.css';

function Stats() {
  const { fetchAll, getStats, getStreaks, books, sessions, loading } = useAppStore();

  const [range, setRange] = useState(30);
  const [chartData, setChartData] = useState([]);
  const [bookStats, setBookStats] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!sessions.length) return;

    const end = new Date();
    const start = subDays(end, range - 1);

    const days = eachDayOfInterval({ start, end });

    const data = days.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');

      const pages = sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.pages_read, 0);

      return {
        date: format(d, 'd MMM', { locale: tr }),
        pages
      };
    });

    setChartData(data);

    const bookData = books.map(b => {
      const total = sessions
        .filter(s => s.book_id === b.id)
        .reduce((sum, s) => sum + s.pages_read, 0);

      return {
        name: b.title,
        pages: total,
        color: b.cover_color || '#3498db'
      };
    }).sort((a, b) => b.pages - a.pages).slice(0, 5);

    setBookStats(bookData);

  }, [sessions, range, books]);

  const stats = getStats();
  const streaks = getStreaks();

  const totalBooks = books.length;
  const completedBooks = books.filter(b => b.status === 'completed').length;

  const COLORS = ['#3498db','#2ecc71','#e74c3c','#f39c12','#9b59b6'];

  if (loading) {
    return <div className="page"><div className="loading">Yükleniyor...</div></div>;
  }

  const getMotivationMessage = (streak) => {
  if (streak === 0) {
    return "Hadi yeni bir seriye ilk adımı at! Temiz bir sayfa açma zamanı 📖✨";
  }
  if (streak === 1) {
    return "Her başlangıç yolun yarısıdır, devamını getirebilirsin! 🚀";
  }
  if (streak <= 3) {
    return "Isınıyorsun 🔥 3 gün güzel bir başlangıç!";
  }
  if (streak <= 7) {
    return "1 hafta oldu! Artık bir alışkanlık oluşuyor 📚";
  }
  if (streak <= 15) {
    return "15 gün... Bu artık disiplin. Ciddileşiyoruz 💪";
  }
  if (streak <= 30) {
    return "Kesintisiz 1 aydır okuyorsun! Azmin hayranlık verici. 🏆";
  }
  if (streak <= 50) {
    return "50 gün... Kitap okumak artık senin için bir yaşam stili 🔥";
  }
  if (streak <= 100) {
    return "100 gün!!! Kitaplar artık kişiliğinin bir parçası. 📖🔥";
  }
  return "Efsane seviye. Artık okumak ve sen bir bütünsünüz. 🧠";
};

  return (
    <div className="page">
      <div className="page-header">
        <h1>📈 İstatistikler</h1>
        <p>Okuma performansın ve ilerleme grafikler</p>
      </div>
      {/* === ÜST STAT GRID (3x2) === */}
      <div className="stats-grid">
        <div className="stat-card blue"><h3>{stats.totalPages}</h3><p>📚 Toplam Sayfa</p></div>
        <div className="stat-card green"><h3>{stats.dailyAverage}</h3><p>📊 Günlük Ortalama</p></div>
        <div className="stat-card orange"><h3>{streaks.current}</h3><p>🔥 Güncel Seri</p></div>
        <div className="stat-card purple"><h3>{streaks.longest}</h3><p>🏆 En Uzun Seri</p></div>
        <div className="stat-card teal"><h3>{completedBooks}</h3><p>✓ Tamamlanan</p></div>
        <div className="stat-card red"><h3>{totalBooks}</h3><p>📖 Toplam Kitap</p></div>
      </div>

      {/* === RANGE SELECTOR === */}
      <div className="time-range-selector">
        {[7, 30, 90].map(r => (
          <button
            key={r}
            className={range === r ? 'active' : ''}
            onClick={() => setRange(r)}
          >
            Son {r} Gün
          </button>
        ))}
      </div>

      {/* === LINE CHART === */}
      <div className="chart-container">
        <h3 className="chart-title">📈 Günlük Okuma Trendi</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pages" name="Okunan Sayfa" stroke="#3498db" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* === BAR CHART === */}
      <div className="chart-container">
        <h3 className="chart-title">📊 Günlük Dağılım</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pages" name="Sayfa" fill="#2ecc71" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === PIE + TOP 5 === */}
      <div className="two-column-grid">

        <div className="chart-container">
          <h3 className="chart-title">📚 Kitap Dağılımı</h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={bookStats}
                dataKey="pages"
                nameKey="name"
                outerRadius={110}
                innerRadius={40}
                paddingAngle={3}
                labelLine={false}
                label={({ name, percent }) =>
                  percent > 0.05 ? `${name}` : ''
                }
              >
                {bookStats.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* === TOP 5 === */}
        <div className="chart-container">
          <h3 className="chart-title">🏆 En Çok Okunanlar</h3>

          <div className="book-stats-list">
            {bookStats.map((b, i) => (
              <div key={i} className="book-stat-item">
                <div className="book-rank">{i + 1}</div>

                <div className="book-stat-bar-container">
                  <div className="book-stat-name">{b.name}</div>

                  <div className="book-stat-bar">
                    <div
                      className="book-stat-fill"
                      style={{
                        width: `${(b.pages / bookStats[0]?.pages) * 100}%`,
                        background: b.color
                      }}
                    />
                  </div>

                  <div className="book-stat-pages">{b.pages} sayfa</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === MOTIVATION === */}
      <div className="motivation-box">
        <h3>🔥 Serine Gözat!</h3>
        <p>
          {streaks.current} gündür kesintisiz okuyorsun.
          <br />
          {getMotivationMessage(streaks.current)}
        </p>
      </div>

    </div>
  );
}

export default Stats;