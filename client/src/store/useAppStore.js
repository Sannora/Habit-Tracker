import { create } from 'zustand';
import { format, subDays } from 'date-fns';

export const useAppStore = create((set, get) => ({
  books: [],
  sessions: [],
  user: null,

  loading: true,

  // =========================
  // FETCH
  // =========================
  fetchAll: async () => {
    set({ loading: true });

    try {
      const [books, sessions, user] = await Promise.all([
        window.electronAPI.books.getAll(),
        window.electronAPI.sessions.getAll(),
        window.electronAPI.user.get()
      ]);

      set({ books, sessions, user, loading: false });
    } catch (error) {
      console.error('Global fetch error:', error);
      set({ loading: false });
    }
  },

  refreshSessions: async () => {
    const sessions = await window.electronAPI.sessions.getAll();
    set({ sessions });
  },

  refreshBooks: async () => {
    const books = await window.electronAPI.books.getAll();
    set({ books });
  },

  // =========================
  // DERIVED DATA
  // =========================
  getStats: () => {
    const { books, sessions } = get();

    const totalPages = sessions.reduce((sum, s) => sum + (s.pages_read || 0), 0);

    const dailyAverage =
      sessions.length > 0 ? Math.round(totalPages / sessions.length) : 0;

    const completedBooks = books.filter(b => b.status === 'completed').length;

    return {
      totalPages,
      dailyAverage,
      totalBooks: books.length,
      completedBooks
    };
  },

  getStreaks: () => {
    const { sessions } = get();

    if (sessions.length === 0) return { current: 0, longest: 0 };

    const uniqueDays = [...new Set(sessions.map(s => s.date))].sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    const hasToday = uniqueDays.includes(today);
    const hasYesterday = uniqueDays.includes(yesterday);

    if (!hasToday && !hasYesterday) {
      currentStreak = 0;
    } else {
      let checkDate = hasToday ? new Date() : subDays(new Date(), 1);
      currentStreak = 1;

      for (let i = 1; i < uniqueDays.length; i++) {
        const prev = format(subDays(checkDate, i), 'yyyy-MM-dd');
        if (uniqueDays.includes(prev)) currentStreak++;
        else break;
      }
    }

    for (let i = 1; i < uniqueDays.length; i++) {
      const d1 = new Date(uniqueDays[i]);
      const d2 = new Date(uniqueDays[i - 1]);

      const diff = (d1 - d2) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  }
}));