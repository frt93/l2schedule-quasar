import { axiosInstance } from 'boot/axios';
import { Cookies } from 'quasar';

export default {
  namespaced: true,
  // otherwise we're on client

  mutations: {
    /**
     *
     * @todo Проверить соблюдение продолжительности жизни токена
     */
    setAuth(state, token) {
      Cookies.set('auth', token, { expires: 365, path: '/' });
    },

    resetAuth() {
      Cookies.remove('auth', { path: '/' });
      delete axiosInstance.defaults.headers.common['auth'];
    },

    setAxiosAuthHeaders(state, token) {
      axiosInstance.defaults.headers.common['auth'] = token;
    },
  },

  actions: {
    /**
     * Отправляем запрос с данными для регистрации пользователя.
     * Если регистрация успешна - коммитим мутации
     *
     * @param credentials       Регистрационные данные пользователя
     */
    signUp({ commit }, credentials) {
      axiosInstance
        .post('/users/create', credentials)
        .then(res => {
          commit('user/setUser', res.data.user, { root: true });
          commit('setAuth', res.data.token);
          commit('setAxiosAuthHeaders', res.data.token);
        })
        .catch(e => {});
    },

    /**
     * Отправляем запрос на авторизацию пользователя
     * Если авторизация успешна - коммитим мутации
     *
     * @param credentials       Авторизационные данные пользователя
     */
    signIn({ commit }, credentials) {
      axiosInstance
        .post('/users/signin', credentials)
        .then(res => {
          commit('user/setUser', res.data.user, { root: true });
          commit('setAuth', res.data.token);
          commit('setAxiosAuthHeaders', res.data.token);
        })
        .catch(e => {});
    },

    /**
     * Авторизуем пользователя при инициализации приложения.
     * Метод вызывается из auth middleware
     *
     * @param credentials       Авторизационные данные пользователя
     */
    authorize({ commit }, { user, token }) {
      commit('user/setUser', user, { root: true });
      commit('setAxiosAuthHeaders', token);
    },

    logout({ commit }) {
      commit('resetAuth');
      commit('user/setUser', null, { root: true });
    },
  },
};
