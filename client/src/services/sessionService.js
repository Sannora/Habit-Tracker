import api from './electronAPI'

const sessionService = {

    // FETCH SESSIONS
    fetchSessions: async () => {
        return await api.getSessions();
    },

    // ADD SESSION
    addSession: async (session) => {
        return await api.createSession(session);
    },

    // UPDATE SESSION
    updateSession: async (id, session) => {
        return await api.updateSession(id, session);
    },

    // DELETE SESSION
    deleteSession: async (id) => {
        return await api.deleteSession(id);
    },

    // GET SESSIONS BY DATE
    getSessionsByDate: async (start, end) => {
        return await api.getSessionsByDateRange(start, end);
    },

    // GET SESSIONS BY BOOK
    getSessionsByBook: async (bookId) => {
        return await api.getSessionsByBook(bookId);
    },

}

export default sessionService;