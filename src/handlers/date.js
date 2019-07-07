import jsCookie from 'js-cookie';
import { DateTime, Settings } from 'luxon';

export default {
  /**
   * Устанавливаем язык пакета по умолчанию
   *
   * @param {String} lang       Язык пользователя
   */
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

  /**
   * На странице настроек данных аккаунта пользователь может выбрать подходящий для него часовой пояс из предложенного списка.
   * Постараемся в процессе регистрации проверить вхождение определенного пакетом luxon часового пояса пользователя в данный список.
   * Если вхождение есть - вернем значение. В противном случае вернем null и время для пользователя будет отображаться на основании
   * системных данных его ПО без привязки к выбранному часовому поясу
   *
   * @param {Array} lang        Язык пользователя
   */
  async isTimezoneInList(lang) {
    let list;
    const userTimezone = this.getCurrentTimezone();

    await import(`lang/${lang}/timezones-countries`).then(data => {
      list = data.default.getTimezonesList();
    });

    const tz = list.filter(zone => {
      return zone.value === userTimezone;
    });

    if (tz.length) {
      return tz[0].value;
    }

    return null;
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

  /**
   * Проверяем наличие в указанном часовом поясе перехода на зимнее/летнее время
   *
   * @param {String} timezone   Установленный часовой пояс пользователя
   */
  isTimezoneInDST(timezone) {
    if (!timezone || timezone === 'local') {
      timezone = this.getCurrentTimezone();
    }

    return DateTime.local().setZone(timezone).isInDST;
  },

  /**
   * Проверяем куки с названием часового пояса пользователя. Если пользователь авторизован - сверяем с названием час. пояса, сохраненным в базе данных.
   * В итоге устанавливаем полученный часовой пояс как значение по умолчанию для экземпляра luxon
   *
   * @param {Object | null} user   Инстанс данных пользователя
   */
  setTimezone(user) {
    const timezoneCookie = jsCookie.get('timezone');
    let timezone;

    if (user !== null) {
      const userTimezone = user.metadata.timezone;
      /**
       * Пользователь авторизован. Возьмем значение часового пояса из его инстанса
       */
      timezone = userTimezone;

      if (timezoneCookie !== userTimezone) {
        /**
         * В инстансе пользователя указан кастомный часовой пояс и значение куков не равно значению инстанса - перезаписываем куки
         */
        this.setTimezoneCookie(userTimezone);
      }
    }

    if (user === null) {
      /**
       * Пользователь гость. Возьмем значение из куков. В случае их отсутствия в переменную запишется null
       */
      timezone = timezoneCookie;
    }

    if (timezone == null || timezone === 'null') {
      /**
       * Если у пользователя в инстансе не указан кастомный часовой пояс(и, соответственно, значение 'null' записано в куки)/отсутствуют куки - опеределим локальный часовой пояс
       */
      timezone = this.getCurrentTimezone();
    }

    this.setDefaultZone(timezone);
  },

  /**
   * Записываем значение часового пояса в куки
   * @param {String} timezone   Название часового пояса
   */
  setTimezoneCookie(timezone) {
    jsCookie.set('timezone', timezone, { expires: 3650 });
  },
};
