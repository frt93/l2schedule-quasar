import VueI18n from 'vue-i18n';
import { Cookies } from 'quasar';
import messages from '../lang';

export default ({ app, Vue, store, ssrContext }) => {
  Vue.use(VueI18n);
  let lang;
  // Определяем/устанавливаем язык пользователя
  if (process.env.SERVER) {
    lang = getLang(ssrContext, app); // Вызываем на стороне сервера
  }

  app.i18n = new VueI18n({
    locale: lang,
    fallbackLocale: lang,
    messages,
  });
};

const getLang = (ssrContext, app) => {
  const cookies = Cookies.parseSSR(ssrContext);
  let lang;

  if (!cookies.has('lang')) {
    // Если нет куков с языком - установим их
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

    // Записываем выбранное значение в куки
    // cookies.set('lang', lang, { expires: 3650, path: '' });
  } else {
    // Куки есть. Берем из них значение, передаем в стор и возвращаем
    lang = cookies.get('lang');
  }

  app.store.commit('user/setLanguage', lang);
  return lang;
};
