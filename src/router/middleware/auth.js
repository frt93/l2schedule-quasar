import { Cookies } from 'quasar';
import { axiosInstance } from 'boot/axios';

/**
 * Пробуем авторизовать пользователя при запуске приложения
 */
export const autologin = async ({ store, ssrContext, next }) => {
  if (process.env.SERVER) {
    console.log(ssrContext.req.language);
    const cookies = Cookies.parseSSR(ssrContext);
    const token = cookies.get('auth');
    const lang = cookies.get('lang');

    if (!lang) {
      await setLang(cookies, ssrContext);
    }

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
export const guest = ({ next, to, from, Router, store, ssrContext }) => {
  const token = authToken(ssrContext);
  const user = getUser(store);

  if (user !== null || token) {
    Router.replace({ name: 'home' });
  }

  return next();
};

/**
 * Пропускаем только авторизованных пользователей
 */
export const user = ({ next, to, from, Router, store, ssrContext }) => {
  const token = authToken(ssrContext);
  const user = getUser(store);

  if (user === null || !token) {
    next({
      name: 'signin',
      params: {
        redirect: to.name,
      },
    });
  }

  return next();
};

/**
 * Пропускаем только админов
 */
export const admin = ({ next, to, from, Router, store, ssrContext }) => {
  const user = getUser(store);

  if (user) {
    next({
      path: '/fuckoff',
    });
  } else next();
};

/**
 * Получаем экземпляр пользователя из store
 *
 * @param store
 */
const getUser = store => {
  return store.state.user.instance;
};

/**
 * Парсим куки и проверяем наличие в них токена авторизации
 *
 * @param {*} ssrContext
 * @todo Убрать, если не понадобится. Так же вызывается в функциях выше
 */
const authToken = ssrContext => {
  const cookies = () => {
    return process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
  };

  return cookies().has('auth');
};

const setLang = (cookies, ssrContext) => {
  const lang = ssrContext.req.locale;
  console.log(lang);
  cookies.set('lang', lang);
};
