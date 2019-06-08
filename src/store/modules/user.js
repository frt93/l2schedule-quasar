export default {
  namespaced: true,
  state: {
    instance: null,
    lang: 'ru',
  },

  mutations: {
    setUser(state, user) {
      state.instance = user;
    },
  },

  actions: {},

  getters: {
    getUser(state) {
      return state.instance;
    },
  },
};
