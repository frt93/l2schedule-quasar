import { Cookies } from 'quasar';
import { axiosInstance } from 'boot/axios';

/**
 * Пробуем авторизовать пользователя при запуске приложения
 */
export const autologin = async ({ store, ssrContext, next }) => {
  if (ssrContext) {
    const cookies = Cookies.parseSSR(ssrContext);
    const token = cookies.get('auth');

    if (token) {
      await axiosInstance
        .post('/users/authorize', { token })
        .then(res => {
          store.dispatch('auth/authorize', { user: res.data, token });
        })
        .catch(e => {
          store.commit('user/setUser', null, { root: true });
        });
    } else {
      store.commit('user/setUser', null, { root: true });
    }
  }

  return next();
};

/**
 * Пропускаем только гостей
 */
export const isGuest = ({ next, to, from, Router, store, ssrContext }) => {
  // const token = authToken(ssrContext);
  const user = getUser(store);

  if (user !== null) {
    Router.push({ name: 'main' });
  }

  return next();
};

/**
 * Пропускаем только авторизованных пользователей
 */
export const isUser = ({ next, to, from, Router, store, ssrContext }) => {
  const user = getUser(store);
  // const token = authToken(ssrContext);

  if (!user) {
    Router.push({ name: 'signin' });
  }

  return next();
};

/**
 * Получаем экземпляр пользователя из store
 *
 * @param store
 */
const getUser = store => {
  return store.state.user.user;
};

/**
 * Парсим куки и проверяем наличие в них токена авторизации
 *
 * @param {*} ssrContext
 */
const authToken = ssrContext => {
  const cookies = () => {
    return process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
  };

  return cookies().has('auth');
};
