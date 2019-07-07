import { Quasar, Cookies } from 'quasar';
import jsCookie from 'js-cookie';

import { i18n } from 'boot/i18n.js';
import dateAPI from './date';
import userAPI from './user/api';

export default {
  /**
   * Переводим приложение на выбранный пользователем язык.
   * Устанавливаем языковой заголовк http-клиенту
   * Устанавливаем язык пакету luxon
   * Перезаписываем куки, если они отсутствуют или хранимое в них значение разнится со значением, полученным из бд (для авторизованных пользователей)
   *
   * @param {String} lang     Язык пользователя
   */
  async init(lang) {
    i18n.locale = lang;
    await import(`quasar/lang/${lang}`).then(lang => {
      Quasar.lang.set(lang.default);
    });

    if (process.env.CLIENT) {
      dateAPI.setDefaultLocale(lang);
      userAPI.setLanguageHeader(lang);
      const langCookie = jsCookie.get('lang');
      if (!langCookie || langCookie !== lang) {
        this.setLangCookies(lang);
      }
    }
  },

  setLangCookies(lang) {
    jsCookie.set('lang', lang, { expires: 3650 });
  },

  getLangCookies() {
    return jsCookie.get('lang');
  },
};
