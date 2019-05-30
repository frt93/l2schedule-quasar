import axios from 'axios';
import { Cookies } from 'quasar';

export default {
  namespaced: true,
  // otherwise we're on client
  state: {},

  mutations: {
    /**
     *
     * @todo Проверить соблюдение продолжительности жизни токена
     */
    setAuthCookie(state, token) {
      Cookies.set('authenticate', token, { expires: 365, path: '/' });
    },

    resetAuthCookie() {
      Cookies.remove('authenticate');
    },

    setAxiosAuthHeaders(state, token) {
      axios.defaults.headers.common['authorization'] = token;
    },

    resetAxiosAuthHeaders() {
      delete axios.defaults.headers.common['authorization'];
    },
  },

  actions: {
    /**
     * Отправляем запрос с данными для регистрации пользователя.
     * Если регистрация успешна - коммитим мутации
     *
     * @param credentials       Регистрационные данные пользователя
     */
    async signUp({ commit }, credentials) {
      const { data } = await this._vm.$axios.post('/users/create', credentials);
      commit('user/setUser', data.user, { root: true });
      commit('setAuthCookie', data.token);
      commit('setAxiosAuthHeaders', data.token);
    },

    /**
     * Отправляем запрос на авторизацию пользователя
     * Если авторизация успешна - коммитим мутации
     *
     * @param credentials       Авторизационные данные пользователя
     */
    async signIn({ commit }, credentials) {
      const { data } = await this._vm.$axios.post('/users/signin', credentials);
      await commit('user/setUser', data.user, { root: true });
      await commit('setAuthCookie', data.token);
      await commit('setAxiosAuthHeaders', data.token);
    },

    /**
     * Пытаемся авторизовать пользователя при инициализации приложения.
     *
     * @param credentials       Авторизационные данные пользователя
     */
    async authorize({ commit, dispatch }, ssrContext) {
      const cookies = () => {
        return process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
      };

      if (cookies().has('authenticate')) {
        const token = await cookies().get('authenticate');

        await this._vm.$axios
          .post('/users/authorize', { token })
          .then(res => {
            commit('user/setUser', res.data, { root: true });
            commit('setAxiosAuthHeaders', token);
          })
          .catch(e => {});
      } else {
        commit('user/resetUser', null, { root: true });
      }
    },

    logout({ commit }) {
      commit('resetAuthCookie');
      commit('resetAxiosAuthHeaders');
      commit('user/resetUser', null, { root: true });
    },
  },

  getters: {},
};
