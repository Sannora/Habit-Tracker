import api from './electronAPI';

const userService = {

  getUser: async () => {
    return await api.getUser();
  },

  updateUser: async (updates) => {
    return await api.updateUser(updates);
  }

};

export default userService;