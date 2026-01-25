import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Books from './components/Books/Books';
import AddBook from './components/AddBook/AddBook';
import EditBook from './components/EditBook/EditBook';
import AddReading from './components/AddReading/AddReading';
import Stats from './components/Stats/Stats';
import Settings from './components/Settings/Settings';
import './App.css';

function App() {
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const user = await window.electronAPI.user.get();
        if (user?.theme) {
          document.documentElement.setAttribute('data-theme', user.theme);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadTheme();
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/add-book" element={<AddBook />} />
          <Route path="/edit-book/:id" element={<EditBook />} />
          <Route path="/add-reading" element={<AddReading />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
