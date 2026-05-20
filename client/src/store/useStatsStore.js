import { create } from 'zustand';
import useBooksStore from './useBooksStore';
import useSessionsStore from './useSessionsStore';

const useStatsStore = create(() => ({

  // =====================
  // BASIC STATS
  // =====================

  getTotalPages: () => {
    const sessions = useSessionsStore.getState().sessions;
    return sessions.reduce((sum, s) => sum + (s.pages_read || 0), 0);
  },

  getDailyAverage: () => {
    const sessions = useSessionsStore.getState().sessions;
    if (!sessions.length) return 0;

    const total = sessions.reduce((sum, s) => sum + (s.pages_read || 0), 0);
    return Math.round(total / sessions.length);
  },

  getActiveBooksCount: () => {
    const books = useBooksStore.getState().books;
    return books.filter(b =>
      b.status === 'active' || b.status === 'reading'
    ).length;
  },

  getTotalBooksCount: () => {
    return useBooksStore.getState().books.length;
  },

  getCompletedBooksCount: () => {
    const books = useBooksStore.getState().books;
    return books.filter(b => b.status === 'completed').length;
  },

  getRecentSessions: () => {
    const sessions = useSessionsStore.getState().sessions;

    return [...sessions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  },

  getStreaks: () => {
    const sessions = useSessionsStore.getState().sessions;

    if (!sessions.length) return { current: 0, longest: 0 };

    const uniqueDays = [...new Set(sessions.map(s => s.date))].sort();

    let current = 0;
    let longest = 0;
    let temp = 1;

    const today = new Date().toISOString().split('T')[0];

    if (!uniqueDays.includes(today)) {
      current = 0;
    } else {
      current = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);

        const ds = d.toISOString().split('T')[0];

        if (uniqueDays.includes(ds)) current++;
        else break;
      }
    }

    for (let i = 1; i < uniqueDays.length; i++) {
      const diff =
        (new Date(uniqueDays[i]) - new Date(uniqueDays[i - 1])) /
        (1000 * 60 * 60 * 24);

      if (diff === 1) {
        temp++;
        longest = Math.max(longest, temp);
      } else {
        temp = 1;
      }
    }

    return { current, longest };
  },

  getMonthlyTotalPages: () => {
    const sessions = useSessionsStore.getState().sessions;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return sessions
      .filter((s) => {
        const date = new Date(s.date);

        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, s) => sum + (s.pages_read || 0), 0);
  },

  getMonthlyDailyAverage: () => {
    const sessions = useSessionsStore.getState().sessions;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlySessions = sessions.filter((s) => {
      const date = new Date(s.date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    if (!monthlySessions.length) return 0;

    const total = monthlySessions.reduce(
      (sum, s) => sum + (s.pages_read || 0),
      0
    );

    return Math.round(total / monthlySessions.length);
  },

  getMonthlyActiveBooksCount: () => {
    const books = useBooksStore.getState().books;

    return books.filter(
      (b) => b.status === 'active' || b.status === 'reading'
    ).length;
  },

  getMonthlyTotalBooksCount: () => {
    const books = useBooksStore.getState().books;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return books.filter((b) => {
      if (!b.created_at) return true;

      const created = new Date(b.created_at);

      return (
        created.getMonth() === currentMonth &&
        created.getFullYear() === currentYear
      );
    }).length;
  },

  // =====================
  // 🧠 LEVELING SYSTEM
  // =====================

  getTotalXP: () => {
    const sessions = useSessionsStore.getState().sessions;
    return sessions.reduce((sum, s) => sum + (s.pages_read || 0), 0);
  },

  getLevel: () => {
    const xp = useStatsStore.getState().getTotalXP();
    return Math.floor(Math.sqrt(xp / 100));
  },

  getXPForLevel: (level) => {
    return Math.pow(level, 2) * 100;
  },

  getCurrentLevelXP: () => {
    const level = useStatsStore.getState().getLevel();
    return Math.pow(level, 2) * 100;
  },

  getNextLevelXP: () => {
    const level = useStatsStore.getState().getLevel();
    return Math.pow(level + 1, 2) * 100;
  },

  getLevelProgress: () => {
    const xp = useStatsStore.getState().getTotalXP();
    const current = useStatsStore.getState().getCurrentLevelXP();
    const next = useStatsStore.getState().getNextLevelXP();

    if (next === current) return 1;

    return Math.min((xp - current) / (next - current), 1);
  },

  getXPToNextLevel: () => {
    const xp = useStatsStore.getState().getTotalXP();
    const next = useStatsStore.getState().getNextLevelXP();
    return next - xp;
  },

  getStreakBonusXP: () => {
    const { current } = useStatsStore.getState().getStreaks();

    if (current >= 7) return 50;
    if (current >= 3) return 20;
    return 0;
  }
}));

export default useStatsStore;