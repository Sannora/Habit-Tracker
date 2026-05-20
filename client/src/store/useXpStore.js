import { create } from 'zustand';
import useBooksStore from './useBooksStore';
import useSessionsStore from './useSessionsStore';
import useUserStore from './useUserStore';

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const XP_CONFIG = {
  // =========================
  // BASE XP
  // =========================
  pageXP: 0.2,
  dailyAvgMultiplier: 2,

  // =========================
  // GOALS
  // =========================
  goalXP: 25,
  streakGoalBonus: 50,

  // =========================
  // BOOK COMPLETION
  // =========================
  bookBaseXP: 25,
  bookPer100PagesXP: 12,

  // =========================
  // STREAKS
  // =========================
  streakMilestones: {
    3: 30,
    7: 80,
    14: 180,
    30: 500
  },

  // =========================
  // PAGE MILESTONES
  // =========================
  milestones: [
    { pages: 1000, xp: 50, title: 'İlk 1000 Sayfa' },
    { pages: 2500, xp: 120, title: '2500 Sayfa' },
    { pages: 5000, xp: 300, title: '5000 Sayfa' },
    { pages: 10000, xp: 800, title: '10000 Sayfa' }
  ]
};

const calculateStreakXP = (streak) => {
  if (streak >= 30) return streak * 40;
  if (streak >= 14) return streak * 28;
  if (streak >= 7) return streak * 18;
  if (streak >= 3) return streak * 10;
  if (streak >= 1) return streak * 5;

  return 0;
};

const getRankData = (level) => {
  if (level >= 50) {
    return {
      title: 'Efsane Okur',
      icon: '👑',
      color: '#e63946'
    };
  }

  if (level >= 35) {
    return {
      title: 'Kitap Bağımlısı',
      icon: '🧠',
      color: '#9b59b6'
    };
  }

  if (level >= 25) {
    return {
      title: 'Kitapkurdu',
      icon: '📚',
      color: '#3498db'
    };
  }

  if (level >= 15) {
    return {
      title: 'Sıkı Okur',
      icon: '🔥',
      color: '#f39c12'
    };
  }

  if (level >= 8) {
    return {
      title: 'Deneyimli Okur',
      icon: '⭐',
      color: '#2ecc71'
    };
  }

  return {
    title: 'Çaylak Okur',
    icon: '🌱',
    color: '#95a5a6'
  };
};

const useXpStore = create((set, get) => ({

  // =========================
  // TOTAL XP
  // =========================
  getXP: () => {
    const books = useBooksStore.getState().books;
    const sessions = useSessionsStore.getState().sessions;
    const user = useUserStore.getState().user;

    // TOTAL PAGES
    const totalPages = sessions.reduce(
      (sum, s) => sum + (s.pages_read || 0),
      0
    );

    const pageXP = totalPages * XP_CONFIG.pageXP;

    // DAILY AVG
    const dailyAvg =
      sessions.length > 0
        ? totalPages / sessions.length
        : 0;

    const dailyXP =
      dailyAvg * XP_CONFIG.dailyAvgMultiplier;

    // STREAK
    const streak = get().getStreak();

    const streakXP =
      calculateStreakXP(streak);

    // GOAL XP
    const goalXP =
      get().getGoalXP(sessions, user);

    // BOOK XP
    const bookXP = books
      .filter(b => b.status === 'completed')
      .reduce((sum, book) => {
        return (
          sum +
          XP_CONFIG.bookBaseXP +
          (
            (book.total_pages / 100) *
            XP_CONFIG.bookPer100PagesXP
          )
        );
      }, 0);

    // MILESTONES
    const milestoneXP =
      get().getMilestoneXP(totalPages);

    return Math.floor(
      pageXP +
      dailyXP +
      streakXP +
      goalXP +
      bookXP +
      milestoneXP
    );
  },

  getLevelData: () => {
    let xp = get().getXP();

    let level = 1;
    let threshold = 100;

    while (xp >= threshold) {
      xp -= threshold;
      level++;

      threshold = Math.floor(
        100 * Math.pow(level, 1.55)
      );
    }

    const rank = getRankData(level);

    return {
      level,
      currentXP: xp,
      nextLevelXP: threshold,
      progress: clamp(
        (xp / threshold) * 100,
        0,
        100
      ),

      remainingXP:
        threshold - xp,

      totalXP:
        get().getXP(),

      rankTitle:
        rank.title,

      rankIcon:
        rank.icon,

      rankColor:
        rank.color
    };
  },

  getStreak: () => {
    const sessions =
      useSessionsStore.getState().sessions;

    if (!sessions.length) return 0;

    const uniqueDays = [
      ...new Set(
        sessions.map(s => s.date)
      )
    ].sort();

    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    if (!uniqueDays.includes(today)) {
      return 0;
    }

    let streak = 1;

    for (let i = 1; i < uniqueDays.length; i++) {
      const d = new Date(today);

      d.setDate(d.getDate() - i);

      const check =
        d.toISOString().split('T')[0];

      if (uniqueDays.includes(check)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  getGoalXP: (sessions, user) => {
    if (!user) return 0;

    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    const todayPages = sessions
      .filter(s => s.date === today)
      .reduce(
        (sum, s) =>
          sum + (s.pages_read || 0),
        0
      );

    let xp = 0;

    if (todayPages >= user.daily_goal) {
      xp += XP_CONFIG.goalXP;
    }

    return xp;
  },

  getMilestoneXP: (totalPages) => {
    return XP_CONFIG.milestones.reduce(
      (sum, m) => {
        return totalPages >= m.pages
          ? sum + m.xp
          : sum;
      },
      0
    );
  },

  getNextMilestone: () => {
    const sessions =
      useSessionsStore.getState().sessions;

    const totalPages = sessions.reduce(
      (sum, s) => sum + (s.pages_read || 0),
      0
    );

    return XP_CONFIG.milestones.find(
      m => totalPages < m.pages
    );
  },

  getAchievements: () => {
    const sessions =
      useSessionsStore.getState().sessions;

    const books =
      useBooksStore.getState().books;

    const streak =
      get().getStreak();

    const totalPages = sessions.reduce(
      (sum, s) => sum + (s.pages_read || 0),
      0
    );

    const completedBooks =
      books.filter(
        b => b.status === 'completed'
      ).length;

    return [
      {
        id: 'pages-1000',
        unlocked: totalPages >= 1000,
        icon: '📖',
        title: '1000 Sayfa'
      },

      {
        id: 'streak-7',
        unlocked: streak >= 7,
        icon: '🔥',
        title: '7 Gün Seri'
      },

      {
        id: 'books-5',
        unlocked: completedBooks >= 5,
        icon: '📚',
        title: '5 Kitap Bitirdi'
      },

      {
        id: 'pages-10000',
        unlocked: totalPages >= 10000,
        icon: '👑',
        title: '10K Sayfa'
      }
    ];
  },

  getXPBreakdown: () => {
    const books =
      useBooksStore.getState().books;

    const sessions =
      useSessionsStore.getState().sessions;

    const totalPages = sessions.reduce(
      (sum, s) => sum + (s.pages_read || 0),
      0
    );

    const streak =
      get().getStreak();

    return {
      totalPages,

      pageXP:
        Math.floor(
          totalPages * XP_CONFIG.pageXP
        ),

      streakXP:
        calculateStreakXP(streak),

      streak,

      completedBooks:
        books.filter(
          b => b.status === 'completed'
        ).length
    };
  }

}));

export default useXpStore;