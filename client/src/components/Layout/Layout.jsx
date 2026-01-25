import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '📊 Dashboard', icon: '📊' },
    { path: '/books', label: '📚 Kitaplarım', icon: '📚' },
    { path: '/add-reading', label: '➕ Okuma Ekle', icon: '➕' },
    { path: '/stats', label: '📈 İstatistikler', icon: '📈' },
    { path: '/settings', label: '⚙️ Ayarlar', icon: '⚙️' }, // YENİ!
  ];

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <h2>📖 Reading Tracker</h2>
        </div>
        <ul className="nav-list">
          {navItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout;