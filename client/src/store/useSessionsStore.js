import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import sessionService from '../services/sessionService';

const useSessionsStore = create(
  immer((set, get) => ({
    sessions: [],
    loading: false,
    error: null,

    fetchSessions: async () => {

      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {

        const sessions = await sessionService.fetchSessions();

        set((state) => {
          state.sessions = sessions;
          state.loading = false;
        });

      } catch (error) {

        set((state) => {
          state.error = error;
          state.loading = false;
        });

      }
    },

    addSession: async (sessionData) => {

      try {

        const newSession =
          await sessionService.addSession(sessionData);

        set((state) => {
          state.sessions.push(newSession);
        });

      } catch (error) {

        set((state) => {
          state.error = error;
          state.loading = false;
        });

      }
    },

    updateSession: async (id, updatedSession) => {

      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {

        const updated = await sessionService.updateSession(id, updatedSession);

        set((state) => {
          const index = state.sessions.findIndex((session) => session.id === id);
          if (index !== -1) {
            state.sessions[index] = updated;
          }
          state.loading = false;
        });

      } catch (error) {

        set((state) => {
          state.error = error;
          state.loading = false;
        });

      }
    },

    deleteSession: async (id) => {

      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {

        await sessionService.deleteSession(id);

        set((state) => {
          state.sessions = state.sessions.filter((session) => session.id !== id);
          state.loading = false;
        });

      } catch (error) {

        set((state) => {
          state.error = error;
          state.loading = false;
        });

      }
    }

  }))
);

export default useSessionsStore;