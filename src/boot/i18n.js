import VueI18n from 'vue-i18n';
import { Cookies } from 'quasar';
import messages from '../lang';

let i18n;

export default async ({ app, Vue, store, ssrContext }) => {
  Vue.use(VueI18n);
  let lang;
  // Определяем/устанавливаем язык пользователя
  if (process.env.SERVER) {
    lang = getLang(ssrContext, store); // Вызываем на стороне сервера
  }

  app.i18n = new VueI18n({
    locale: lang,
    fallbackLocale: 'en-us',
    messages,
  });

  i18n = app.i18n;
};

export { i18n };

const getLang = (ssrContext, store) => {
  const cookies = Cookies.parseSSR(ssrContext);
  let lang;

  if (!cookies.has('lang')) {
    // Если нет куков с языком - определим язык при помощи языковых заголовков в теле запроса
    const userLanguages = ssrContext.req.acceptsLanguages();
    // Функция проверяет наличие в списке языков браузера клиента наличие языка переданного в качестве аргумента.
    const entry = lang => {
      return userLanguages.indexOf(lang) != -1;
    };

    if (entry('ru')) {
      lang = 'ru'; // В первую очереь ищем русский
    } else if (entry('uk')) {
      lang = 'uk'; // Затем украинский
    } else {
      lang = 'en-us'; // Если не найдены первые два - устанавливаем английский
    }
  } else {
    // Куки есть. Берем из них значение, передаем в стор и возвращаем
    lang = cookies.get('lang');
  }

  store.commit('user/setLanguage', lang);
  return lang;
};
