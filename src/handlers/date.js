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
   * На странице настроек данных аккаунта пользователь может выбрать подходящий для него часовой пояс из предложенного списка.
   * Постараемся в процессе регистрации проверить вхождения определенного пакетом luxon часового пояса пользователя в данный список.
   * Если вхождение есть - вернем значение. В противном случае вернем null и время для пользователя будет отображаться на основании
   * системных данных его ПО без привязки к выбранному часовому поясу
   *
   * @param {Array} list        Массив с перечнем часовых поясов, предлагаемый для выбора пользователю в настройках
   */
  isTimezoneInList(list) {
    const userTimezone = this.getCurrentTimezone();

    const tz = list.filter(zone => {
      return zone.value === userTimezone;
    });
    if (tz.length) {
      return tz[0].value;
    }
    return null;
  },

  /**
   * Получаем сокращенно наименование текущего часового пояса пользователя, который установлен на его устройстве
   */
  getCurrentTimezoneShortname() {
    const timezone = DateTime.local().offsetNameShort;
    return timezone;
  },

  /**
   * Текущее время пользователя в установленном им часовом поясе
   *
   * @param {String} timezone   Установленный часовой пояс пользователя
   */
  now(timezone) {
    if (!timezone || timezone === 'local') {
      timezone = this.getCurrentTimezone();
    }
    let now = DateTime.local().setZone(timezone);

    return now.toFormat('dd.LL.yyyy HH.mm.ss');
  },

  isTimezoneInDST(timezone) {
    if (!timezone || timezone === 'local') {
      timezone = this.getCurrentTimezone();
    }

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
