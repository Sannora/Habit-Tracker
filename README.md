# 📚 Reading Tracker

A desktop application to track your daily reading habits, visualize progress, and build a consistent reading routine.

---

## 🖼️ Screenshots

### Dashboard
![Dashboard](assets/dashboard.png)

### Heat Map Calendar
![Heat Map](assets/heatmap.png)

### Book Library
![Book Library](assets/library.png)

### Statistics & Charts
![Statistics](assets/stats.png)

### Dark Mode
![Dark Mode](assets/darkmode.png)

---

## ✨ Features

### 📖 Book Management
- Add, edit, and delete books from your reading list
- Track reading progress with visual progress bars
- Set custom cover colors for each book
- Organize books by status (Reading, Completed)

---

### 📅 Visual Calendar
- GitHub-style calendar heat map showing daily reading activity
- Color-coded days based on pages read
- Click any day to view detailed reading sessions
- Navigate through months with intuitive controls

---

### 📊 Detailed Statistics
- Streak tracking (consecutive reading days)
- Charts powered by Recharts
- Daily, weekly, monthly reading trends
- Average pages per day
- Top 5 most-read books

---

### 🎨 Customization
- Dark mode support
- Adjustable daily reading goals
- Personalized user settings
- Custom book colors

---

### 💾 Data Management
- Export / Import data as JSON
- Full local backup system
- Privacy-focused (100% local storage)
- Works offline

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

---

## 📦 Installation

### For Users (Windows)
1. Download latest release
2. Run `Reading Tracker Setup.exe`
3. Follow installation steps
4. Launch from desktop/start menu

---

### For Developers

```bash
git clone https://github.com/Sannora/habit-tracker.git
cd habit-tracker/client
npm install
npm run electron:dev
npm run electron:build
```

---

## 🛠️ Built With

### Frontend
- React 18
- Vite
- Recharts
- date-fns
- Zustand (yet to be added)

### Desktop
- Electron
- better-sqlite3

### Styling
- CSS Variables
- Custom CSS

---

## 📖 Usage Guide

### ➕ Adding a Book
- Go to “Kitaplarım”
- Click “Yeni Kitap Ekle”
- Fill details
- Save

### 📘 Logging Reading
- Go to “Okuma Ekle”
- Select book
- Enter pages
- Save

### 📊 Statistics
- Open “İstatistikler”
- View charts and streaks

### ⚙️ Settings
- Open “Ayarlar”
- Update preferences
- Export/import data

---

## 🗂️ Project Structure

```
reading-tracker/
├── client/
│   ├── electron/
│   │   ├── main.cjs
│   │   ├── preload.cjs
│   │   ├── database.cjs
│   │   └── ipc-handlers.cjs
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 🎯 Roadmap

### v1.1
- State refactor
- UI improvements
- Better animations

### v2.0
- Web version
- Cloud sync
- Auth system
- Social features

### v3.0
- Mobile apps
- Recommendations
- Book APIs integration

---

## 🐛 Known Issues
None currently 🎉

---

## 🤝 Contributing
- Fork repo
- Create branch
- Commit changes
- Push
- Open PR

---

## 👨‍💻 Author
Sannora

GitHub: @Sannora
Email: mmh.melih@gmail.com
