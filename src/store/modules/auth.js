import cookies from 'js-cookie';
import axios from 'axios';

export default {
  namespaced: true,
  state: {},

  mutations: {
    setAuthCookie(state, token) {
      cookies.set('authenticate', token, { expires: 365 });
    },

    resetAuthCookie(state, token) {
      cookies.remove('authenticate');
    },

    setAuthHeaders(state, token) {
      axios.defaults.headers.common['authorization'] = token;
    },

    resetAuthHeaders() {
      delete axios.defaults.headers.common['authorization'];
    },
  },

  actions: {
    async signUp({ commit }, credentials) {
      const { data } = await this._vm.$axios.post('/users/create', credentials);
      commit('user/setUser', data.user, { root: true });
      commit('setAuthCookie', data.token);
      commit('setAuthHeaders', data.token);
    },
  },

  getters: {},
};
