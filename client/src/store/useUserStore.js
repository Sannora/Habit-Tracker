import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import userService from '../services/userService';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      theme: 'light',
      loading: false,
      error: null,

      setUser: (user) => set({ user }),

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

      fetchUser: async () => {
        set({ loading: true, error: null });

        try {
          const user = await userService.getUser();

          set({
            user,
            loading: false,
          });
        } catch (error) {
          set({
            error,
            loading: false,
          });
        }
      },

      updateUser: async (updates) => {
        set({ loading: true, error: null });

        try {
          const updatedUser = await userService.updateUser(updates);

          set((state) => ({
            user: {
              ...state.user,
              ...updatedUser,
            },
            loading: false,
          }));
        } catch (error) {
          set({
            error,
            loading: false,
          });
        }
      },
    }),
    {
      name: 'user-storage',

      // sadece theme persist
      partialize: (state) => ({
        theme: state.theme,
      }),

      // rehydrate sonrası theme uygula
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute(
            'data-theme',
            state.theme
          );
        }
      },
    }
  )
);

export default useUserStore;