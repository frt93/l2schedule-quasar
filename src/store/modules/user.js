import cookies from 'js-cookie';

import api from 'handlers/user/api';
import date from 'handlers/date';

export default {
  namespaced: true,
  state: {
    instance: null,
    language: null,
    timezoneList: null,
    countriesList: null,
  },

  mutations: {
    /**
     * Записываем в state данные пользователя
     *
     * @param {Object} user     Объект с данными пользователя
     */
    setUser(state, user) {
      state.instance = user;
    },

    reset(state) {
      state.instance = null;
      cookies.remove('auth');
    },

    /**
     * Записываем в state массив всех временных зон
     *
     * @param {Array} zones     Массив с временными зонами
     */
    setTimezonesAndCountriesLists(state, payload) {
      const userTimezone = this.getters['user/timezone'];
      state.timezoneList = payload.getTimezonesList(userTimezone);
      state.countriesList = payload.countries;
    },

    /**
     * Устанавливаем язык приложения при инициализации приложения
     *
     * @param {String} lang     Язык
     */
    setLanguage(state, lang) {
      state.language = lang;
    },

    /**
     * Меняем язык в настройках
     */
    changeLanguage(state, lang) {
      state.language = lang;
      cookies.set('lang', lang, { expires: 3650 });
    },

    /**
     * Определяем язык пользователя по кукам браузера.
     * Метод вызывается уже на клиенте в boot файле i18n.
     *
     * Также устанавливает языковой заголовк в http клиент
     */
    defineLanguage(state) {
      const lang = cookies.get('lang');
      state.language = lang;
    },
  },

  actions: {
    /**
     * Авторизуем пользователя при инициализации приложения
     *
     * @param {String} token    Токен авторизации пользователя
     */
    async authorize({ commit }, token) {
      const user = await api.authenticate(token);
      commit('setUser', user);
    },

    /**
     * Если куков со значением текущего часового пояса нет - определим и запишем их
     *
     */
    async getTimezone({ state }) {
      const timezoneCookie = cookies.get('timezone');
      const user = state.instance;
      let timezone;

      if (user != null) {
        const userTimezone = user.metadata.timezone;
        /**
         * Пользователь авторизован. Возьмем значение часового пояса из его инстанса
         */
        timezone = userTimezone;

        if (timezoneCookie !== userTimezone) {
          /**
           * В инстансе пользователя указан кастомный часовой пояс и значение куков не равно значению инстанса - перезаписываем куки
           */
          date.setTimezoneCookie(userTimezone);
        }
      }

      if (user == null) {
        /**
         * Пользователь гость. Возьмем значение из куков. В случае их отсутствия в переменную запишется null
         */
        timezone = timezoneCookie;
      }

      if (timezone == null || timezone === 'null') {
        /**
         * Если у пользователя в инстансе не указан кастомный часовой пояс(и, соответственно, значение 'null' записано в куки)/отсутствуют куки - опеределим локальный часовой пояс
         */
        timezone = date.getCurrentTimezone();
      }

      date.setDefaultZone(timezone);
    },

    /**
     * Авторизуем пользователя и обрабатываем его метаданные
     *
     * @param {Object} user     Экземпляр данных пользователя
     */
    signin({ commit }, user) {
      if (cookies.get('timezone') != user.metadata.timezone) {
        // Если значение часового пользователя в экземпляре данных пользователя и в куках отличаются - перепишем в куки значение из экземпляра данных пользователя
        date.setTimezoneCookie(user.metadata.timezone);
      }

      commit('setUser', user);
    },

    /**
     * Пользователь вышел из аккаунта.
     * Сбрасываем авторизацию. Удаляем информацию о пользователе из стора
     *
     * @param router            Экземпляр VueRouter
     */
    logout({ commit }, router) {
      commit('reset');

      // Перебираем список middleware. Если среди них есть middleware авторизации - перенаправляем разлогиневшегося пользователя
      // на главную, т.к. страница, на которой он разлогинился, доступна только для авторизованных
      const meta = router.currentRoute.meta;
      if (meta && meta.needAuth) {
        router.push({ name: 'home' });
      }
    },
  },

  getters: {
    timezone(state) {
      let timezone;
      if (state.instance !== null) {
        timezone = state.instance.metadata.timezone;
      } else if (state.instance == null) {
        timezone = cookies.get('timezone');
      }

      if (timezone == null || timezone === 'null') {
        /**
         * Если у пользователя в инстансе не указан кастомный часовой пояс(и, соответственно, значение 'null' записано в куки)/отсутствуют куки - вернем значение 'local'
         */
        timezone = 'local';
      }

      return timezone;
    },
  },
};
