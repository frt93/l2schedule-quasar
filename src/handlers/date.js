import { Cookies } from 'quasar';
import jsCookie from 'js-cookie';
import { DateTime, Settings } from 'luxon';

export default {
  setDefaultLocale(lang) {
    Settings.defaultLocale = lang;
  },

  /**
   * Устанавливаем часовой пояс пользователя
   *
   * @param {String} zoneName   Название часового пояса
   */
  setDefaultZone(zoneName) {
    Settings.defaultZoneName = zoneName;
  },

  /**
   * Получаем наименование текущего часового пояса пользователя, который установлен на его устройстве
   */
  getCurrentTimezone() {
    const timezone = DateTime.local().zoneName;
    return timezone;
  },

  /**
   * Получаем сокращенно наименование текущего часового пояса пользователя, который установлен на его устройстве
   */
  getCurrentTimezoneShortname() {
    const timezone = DateTime.local().offsetNameShort;
    return timezone;
  },

  now() {
    var now = DateTime.local().toFormat('dd.LL.yyyy HH.mm');
    return now;
  },

  isInDST(timezone) {
    if (!timezone || timezone === 'local') {
      timezone = this.getCurrentTimezone();
    }
    console.log(timezone);
    return DateTime.local().setZone(timezone).isInDST;
  },

  /**
   * Записываем значение часового пояса в куки
   * @param {String} timezone   Название часового пояса
   */
  setTimezoneCookie(timezone) {
    jsCookie.set('timezone', timezone, { expires: 3650 });
  },
};
