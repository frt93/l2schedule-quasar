export default {
  namespaced: true,
  state: {
    user: null,
  },

  mutations: {
    setUser(state, user) {
      state.user = user;
    },
  },

  actions: {
    setUser(state, user) {
      state.user = user;
    },
  },

  getters: {
    getUser(state) {
      return state.user;
    },
  },
};
