import cookies from 'js-cookie';

import userAPI from 'handlers/user/api';
import dateAPI from 'handlers/date';
import langAPI from 'handlers/lang';

export default {
  namespaced: true,
  state: {
    instance: null,
    language: null,
    languagesList: null,
    timezoneList: null,
    countriesList: null,
    viewedUser: null,
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
     * Записываем в переменные state массивы всех временных зон и стран в выбранной пользователем языковой локализации
     *
     * @param {Array} zones     Массив с временными зонами
     */
    setTimezones_Countries_LanguagesLists(state, payload) {
      const userTimezone = this.getters['user/timezone'];
      state.timezoneList = payload.getTimezonesList(userTimezone);
      state.countriesList = payload.countries;
      state.languagesList = payload.languages;
    },

    /**
     * Устанавливаем язык приложения при инициализации приложения
     *
     * @param {String} lang     Язык
     */
    setLanguage(state, lang) {
      state.language = lang;
    },

    changeDateFormat(state, format) {
      dateAPI.defaultFormat = format;
    },

    /**
     * Запишем в state экземпляр пользователя, чью страницу просматриваем
     */
    viewedUser(state, user) {
      state.viewedUser = user;
    },
  },

  actions: {
    /**
     * Авторизуем пользователя при инициализации приложения
     *
     * @param {String} token    Токен авторизации пользователя
     */
    async authorize({ dispatch, commit }, token) {
      const { user, party } = await userAPI.authenticate(token);
      commit('setUser', user);

      if (party) {
        commit('party/setUserParty', party, { root: true });
      }
      /**
       * На случай, если пользователь пользуется разными типами приложения (сайт, мобильное приложение, десктопное) с разных устройств и меняет в одном из них
       * язык в настройках аккаунта-  необходимо, чтобы при заходе с другого устройства приложение среагировало на изменение настроек и отобразилось на новом языке.
       * Это срабатывает при вызове action'а internationalization на стороне клиента в хуке beforeCreate файла App.vue. Но переводится все кроме meta-свойств (title и пр.).
       * В связи с этим необходим данный костыль с вызовом action'а интернационализации при осуществлении автологина. С помощью проверок на тип process.env ограничиваем спектр
       * операций внутри вызывающейся функции на серверной и клиентской сторонах.
       * @todo Желательно бы с этим разобраться
       */
      dispatch('internationalization');
    },

    /**
     * Авторизуем пользователя и обрабатываем его метаданные
     *
     * @param {Object} user     Экземпляр данных пользователя
     */
    signin({ commit, dispatch }, user) {
      commit('setUser', user);
      /**
       * Установим часовой пояс и язык. Это на случай, если пользователь менял эти данные аккаунта на другом устройстве
       */
      dispatch('internationalization');
      dispatch('setTimezone');
    },

    /**
     * Определяем на каком языке показывать пользователю приложение
     */
    internationalization({ state }) {
      let lang = state.language;
      const user = state.instance;

      if (user !== null) {
        lang = user.metadata.language;
      }

      langAPI.init(lang);
    },

    /**
     * Пользователь сменил язык приложения в настройках
     * @param {String} lang     Язык
     */
    async changeLanguage({ commit }, lang) {
      commit('setLanguage', lang);
      langAPI.init(lang);

      await import(`lang/${lang}/timezones-countries-languages-list`).then(data => {
        commit('setTimezones_Countries_LanguagesLists', data.default);
      });
    },

    /**
     * Проверяем куки с названием часового пояса пользователя.
     */
    setTimezone({ state }) {
      const user = state.instance;
      dateAPI.setTimezone(user);
    },

    /**
     * Пользователь вышел из аккаунта.
     * Сбрасываем авторизацию. Удаляем информацию о пользователе из стора
     *
     * @param router            Экземпляр VueRouter
     */
    logout({ commit }, router) {
      // Перебираем список middleware. Если среди них есть middleware авторизации - перенаправляем разлогиневшегося пользователя
      // на главную, т.к. страница, на которой он разлогинился, доступна только для авторизованных
      const meta = router.currentRoute.meta;
      if (meta && meta.needAuth) {
        router.push({ name: 'home' });
      }
      commit('reset');
    },

    /**
     * Получим экземпляр искомого пользователя
     *
     * @param {String} username   Никнейм пользователя
     */
    async getUser({ commit }, username) {
      const { user } = await userAPI.getUser('username', username);

      if (user) {
        commit('viewedUser', user);
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

    dateFormat(state) {
      let format = dateAPI.defaultFormat;
      if (state.instance !== null && state.instance.metadata.dateFormat) {
        format = state.instance.metadata.dateFormat;
      }

      return format;
    },

    user(state) {
      return state.instance === null ? { metadata: {} } : state.instance;
    },
  },
};
