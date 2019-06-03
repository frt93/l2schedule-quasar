import { axiosInstance } from 'boot/axios';
import cookies from 'js-cookie';

export default {
  namespaced: true,
  // otherwise we're on client

  mutations: {
    /**
     * Устанавливаем куки авторизации
     * @todo Проверить соблюдение продолжительности жизни токена
     */
    setAuth(state, token) {
      cookies.set('auth', token, { expires: 365, secure: true });
    },

    /**
     * Устанавливаем заголовки авторизации http-клиенту
     *
     */
    setAxiosAuthHeaders(state, token) {
      axiosInstance.defaults.headers.common['auth'] = token;
    },

    /**
     * Удаляем заголовки авторизации и сбрасываем куки
     */
    resetAuth() {
      delete axiosInstance.defaults.headers.common['auth'];
      cookies.remove('auth'); // Сторонний пакет
    },
  },

  actions: {
    /**
     * Пользователь зарегистрировался.
     * Записываем пользователя в стор, устанавливаем куки и заголовки авторизации http-клиенту.
     * Затем переадресовываем пользователя на главную
     *
     * @param user              Экземпляр авторизовавшегося пользователя
     * @param token             Токен авторизации
     * @param router            Экземпляр VueRouter
     */
    signUp({ commit }, { user, token, router }) {
      commit('user/setUser', user, { root: true });
      commit('setAuth', token);
      commit('setAxiosAuthHeaders', token);

      router.replace({ name: 'home' });
    },

    /**
     * Авторизация пользователя прошла успешно.
     * Записываем пользователя в стор, устанавливаем куки и заголовки авторизации http-клиенту.
     * Затем переадресовываем пользователя на соответствующий роут
     *
     * @param user              Экземпляр авторизовавшегося пользователя
     * @param token             Токен авторизации
     * @param router            Экземпляр VueRouter
     */
    signIn({ commit }, { user, token, router }) {
      commit('user/setUser', user, { root: true });
      commit('setAuth', token);
      commit('setAxiosAuthHeaders', token);

      // Проверяем наличие параметра переадресации в текущем роуте.
      // Если он есть - перенаправляем пользователя на указанный маршрут. В противном случае отправляем на главную страницу
      const redirect = router.currentRoute.params.redirect;
      const next = redirect ? redirect : 'home';
      router.replace({ name: next });
    },

    /**
     * Пользователь авторизовался при инициализации приложения
     * Метод вызывается из router/middleware/auth
     *
     * @param credentials       Авторизационные данные пользователя
     */
    authorize({ commit }, { user, token }) {
      commit('user/setUser', user, { root: true });
      commit('setAxiosAuthHeaders', token);
    },

    /**
     * Пользователь вышел из аккаунта.
     * Сбрасываем авторизацию. Удаляем информацию о пользователе из стора
     *
     * @param router            Экземпляр VueRouter
     */
    logout({ commit }, router) {
      commit('resetAuth');
      commit('user/setUser', null, { root: true });

      // Перебираем список middleware. Если среди них есть middleware авторизации - перенаправляем разлогиневшегося пользователя
      // на главную, т.к. страница, на которой он разлогинился, доступна только для авторизованных
      router.currentRoute.meta.middleware.map(guard => {
        if (guard.name === 'user') {
          router.push({ name: 'home' });
        }
      });
    },
  },
};
