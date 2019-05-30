export default {
  namespaced: true,
  state: {
    user: null,
  },

  mutations: {
    setUser(state, user) {
      state.user = user;
    },

    resetUser(state) {
      state.user = null;
    },
  },

  actions: {},

  getters: {
    getUser(state) {
      return state.user;
    },
  },
};
