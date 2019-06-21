import { Cookies } from 'quasar';

/**
 * Пропускаем только гостей
 */
export const guest = ({ next, to, from, Router, store, ssrContext }) => {
  const token = authToken(ssrContext);
  const user = getUser(store);
  if (from.params.redirect) {
    /**
     * Если пользователь попал на роут "для гостей" со страницы, требующей авторизации - передаем параметр редиректа,
     * который он получил во время редиректа на страницу авторизации (в middleware user, описанном ниже), при переходе между другими "гостевыми роутами".
     * Например: пользователь пытается перейти на страницу, требующую авторизацию и переадресован на страницу логина. Но у него нет аккаунта и он переходит на страницу регистрации.
     * Вот тут мы и передаем параметр редиректа на потребовавшую авторизацию страницу далее. И в итоге после успешной регистрации он будет переадресован туда, куда пытался попасть в guest моде
     */
    to.params.redirect = from.params.redirect;
  }
  if (token) {
    return next({
      name: from.name || 'home',
      params: {
        redirect: to.name,
      },
    });
  }

  return next();
};

/**
 * Пропускаем только авторизованных пользователей
 */
export const user = ({ next, to, from, Router, store, ssrContext }) => {
  const token = authToken(ssrContext);
  const user = getUser(store);

  if (!token) {
    return next({
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
