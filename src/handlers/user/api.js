import { axiosInstance } from 'boot/axios';
import cookies from 'js-cookie';
import controllers from './controllers';

export default {
  /**
   * Получаем экземпляр пользователя при авторизации во время запуска приложения
   *
   * @param {String} token    Токен авторизации пользователя
   */
  async authenticate(token) {
    let user, party;
    await axiosInstance
      .post('/users/authorize', { token })
      .then(res => {
        user = res.data.user;
        party = res.data.party;
      })
      .catch(e => {
        user = null;
      });

    return { user, party };
  },

  /**
   * Получаем экземпляр пользователя для авторизации
   *
   * @param {Object} credentials   Регистрационные данные пользователя
   */
  async signin(credentials) {
    let user, party, error;
    await axiosInstance
      .post('/users/signin', credentials)
      .then(res => {
        user = res.data.user;
        party = res.data.party;
        cookies.set('auth', res.data.token, { expires: 3650 });
      })
      .catch(e => {
        error = e;
      });
    return { user, party, error };
  },

  /**
   * Авторизуем пользователя на основании данных его аккаунта в выбранном oauth-провайдере
   *
   * @param {Object} credentials   Регистрационные данные пользователя
   */
  async oauthLogin(credentials) {
    let user, party, error;

    await axiosInstance
      .post('/users/signin/oauth', credentials)
      .then(res => {
        user = res.data.user;
        party = res.data.party;
        cookies.set('auth', res.data.token, { expires: 3650 });
      })
      .catch(e => {
        error = e;
      });

    return { user, party, error };
  },

  /**
   * Регистрируем пользователя на основании данных его аккаунта в выбранном oauth-провайдере
   *
   * @param {Object} credentials   Регистрационные данные пользователя
   */
  async oauthRegister(credentials) {
    let user, error;

    await axiosInstance
      .post('/users/create/oauth', credentials)
      .then(res => {
        user = res.data.user;
        cookies.set('auth', res.data.token, { expires: 3650 });
      })
      .catch(e => {
        error = e;
      });

    return { user, error };
  },

  /**
   * Запрос на регистрацию пользователя
   *
   * @param {Object} credentials   Регистрационные данные пользователя
   */
  async signup(credentials) {
    let user, error;
    await axiosInstance
      .post('/users/create', credentials)
      .then(res => {
        user = res.data.user;
        cookies.set('auth', res.data.token, { expires: 3650 });
      })
      .catch(e => {
        error = e;
      });
    return { user, error };
  },

  /**
   * Проверяем свободен ли указанный при регистрации пользователем никнейм
   *
   * @param {String} username   Указанный никнейм
   */
  async checkUsername(username) {
    let error;
    await axiosInstance.post('/users/check/username', { username }).catch(e => {
      error = e;
    });
    return { error };
  },

  /**
   * Проверяем свободен ли указанный при регистрации пользователем email адрес
   *
   * @param {String} email    Указанный адрес электронной почты
   */
  async checkEmail(email) {
    let error;
    await axiosInstance.post('/users/check/email', { email }).catch(e => {
      error = e;
    });
    return { error };
  },

  /**
   * Получаем ISO код страны регистрирующегося пользователя с помощью стороннего сервиса
   */
  async getCountry() {
    let country = null;
    //Сервис запрещает устанавливать сторонние заголовки, поэтому удалим их, а в конце вернем обратно
    const lang = axiosInstance.defaults.headers.common['lang'];
    delete axiosInstance.defaults.headers.common['lang'];

    await axiosInstance.get('https://ipapi.co/json/').then(res => {
      country = res.data.country.toLowerCase();
    });
    this.setLanguageHeader(lang);
    return country;
  },

  /**
   * Первый шаг операции восстановления доступа к аккаунта.
   * Поиск пользователя по email адресу
   *
   * @param {String} email    Адрес электронной почты от аккаунта, доступ к которому хочет восстановить пользователь
   */
  async repairFirstStep(email) {
    let response, error;
    await axiosInstance
      .post('/users/repair', { email })
      .then(res => {
        if (res.data === true) {
          response = true;
        }
      })
      .catch(e => {
        error = e;
      });
    return { response, error };
  },

  /**
   * Второй шаг операции восстановления доступа к аккаунта.
   * Проверка ключа подтверждения операции восстановления доступа
   *
   * @param {String} key      Ключ подтверждения, который пользователь получил в письме, отправленном на email адрес, указанный в первом шаге
   */
  async repairSecondStep(key) {
    let email, error;
    await axiosInstance
      .post('/users/confirm-repair', { key })
      .then(res => {
        email = res.data;
      })
      .catch(e => {
        error = e;
      });
    return { email, error };
  },

  /**
   * Третий и финальный шаг операции восстановления доступа к аккаунта.
   * Отправляем данные, которые на стороне сервера валидируются и сверяются на соответствие друг другу.
   * Если все отлично - устанавливается новый пароль
   *
   * @param {Object} credentials   Данные пользователя, необходимые для смены пароля. Это email адрес и ключ(из предыдущего шага) - для сопоставления, и новый пароль
   */
  async repairThirdStep(credentials) {
    let response, success, error;
    await axiosInstance
      .post('/users/repair/change-password', credentials)
      .then(res => {
        response = true;
        success = res.data.message;
      })
      .catch(e => {
        error = e;
      });
    return { response, success, error };
  },

  /**
   * Запрос на подтверждения email адреса
   *
   * @param {String} key         Ключ подтверждения
   * @param {String | null} id   id пользователя
   */
  async confirmEmail(key, id) {
    let user, success, error;

    await axiosInstance
      .post('/users/confirm/email', { key, id })
      .then(res => {
        if (res.data.user) {
          user = res.data.user;
        }
        success = res.data.message;
      })
      .catch(e => {
        error = e;
      });

    return { user, success, error };
  },

  /**
   * Устанавливаем языковой заголовок http-клиенту для получения ответов с сервера на том же языке, на котором отображается приложение
   *
   * @param {String} lang        Текущий язык пользователя
   */
  setLanguageHeader(lang) {
    axiosInstance.defaults.headers.common['lang'] = lang;
  },

  /**
   * Отправляем запрос на сохранение внесенных пользователем настроек аккаунта
   *
   * @param {String} sub         "Раздел" настроек. Необходим для формирования url запроса
   * @param {Object} payload     Отправляемые данные пользователя
   * @param {String} lang        Язык пользователя
   */
  async settings(sub, payload, lang) {
    let user, success, error;

    if (lang) {
      // Если пользователь сменил язык - изменим языковой заголовок перед запросом, чтобы пользователь
      // получил оповещение об успешной операции или возникшей в ее ходе ошибке на выбранном языке
      this.setLanguageHeader(lang);
    }

    await axiosInstance
      .post(`/users/settings/${sub}`, payload)
      .then(res => {
        user = res.data.user;
        success = res.data.message;
      })
      .catch(e => {
        error = e;
      });

    return { user, success, error };
  },

  /**
   * Отправим запрос на получение экземпляра искомого пользователя
   *
   * @param {String}       key     Ключ, по которому осуществляется поиск пользователя (никнейм/id)
   * @param {String | Int} value   Значение ключа
   */
  async getUser(key, value) {
    let user, error;

    await axiosInstance
      .get(`/users/get?key=${key}&value=${value}`)
      .then(res => {
        user = res.data;
      })
      .catch(e => {
        error = e;
      });

    return { user, error };
  },
};
