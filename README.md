# 📚 Reading Tracker

A desktop application to track your daily reading habits, visualize progress, and build a consistent reading routine.

---

## **Release 1.1.0 is Now Live! ​🎉**

Now with 1.1.0 live, I have some exciting news :). The app is now more compact with date and rate systems added. The scene for future updates is set by Zustand. I tried to improve the user experience as whole with feedbacks from my users(my and my girlfriend :) ). And maybe the most importantly, the app is now gamified with a new leveling system. Make sure to check the changelog below for details:

### v1.1.0 Changelog

####**✨ New Features**

-XP & Level system added: Users can earn "reader points" and level up by reading.
-Book dating system added: Now users can see the interval and total time for a book's completion.
-Book rating system added: Users now can rate books out of 5 stars.

####**🐛 Fixes**
-App covering only the half of the window is fixed.

####**⚡ Improvements**
-Dashboard stats are now localised to current month; for overall stats you can still see "İstatistikler" page.
-Better UI structure
-Added Zustand state management

## 🖼️ Screenshots

### Dashboard
<img width="1897" height="977" alt="image" src="https://github.com/user-attachments/assets/94283021-5e0d-4049-890d-770f51b6979a" />

### Heat Map Calendar
<img width="290" height="311" alt="image" src="https://github.com/user-attachments/assets/876077b8-90b3-4e76-a2ec-197abe3983d3" />

### Book Library
<img width="923" height="968" alt="image" src="https://github.com/user-attachments/assets/52fb7cb3-3900-40b2-bb3a-0af76f2f7617" />

### Statistics & Charts
<img width="484" height="921" alt="image" src="https://github.com/user-attachments/assets/11c5e434-a75d-4c7c-80b6-a925bc9bcb10" />

### Dark Mode
<img width="368" height="913" alt="image" src="https://github.com/user-attachments/assets/c4613937-8011-4be5-9998-b0f882f6dfd0" />

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
