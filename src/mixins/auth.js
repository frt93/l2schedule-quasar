import { debounce } from 'quasar';
export default {
  data() {
    return {
      login: '', // Только для компонента авторизации
      username: '',
      email: '',
      password: '',
      hidePwd: true,

      usernameError: false,
      emailError: false,
      passwordError: false,

      usernameErrorMessage: '',
      emailErrorMessage: '',
      passwordErrorMessage: '',

      loading: {
        username: false,
        email: false,
        repair: false,
      },
    };
  },

  methods: {
    /**
     * Валидируем никнейм пользователя
     *
     * @param {String} username   Указанный пользователем никнейм
     * @param {String} page       Параметр, определяющий источник вызова метода (компонент). По умолчанию предполагается, что метод вызван на странице регистрации.
     *                            Со страниц логина и восстановления доступа вызывается со значениями 'signin' и 'repair' соответственно
     */
    validateUsername: debounce(function(username, page = 'signup') {
      this.usernameError = false;
      this.usernameErrorMessage = '';

      // Начинаем валидацию только:
      // 1. Если передано какое-то значение, а не пустая строка
      // 2. Если на момент начала срабатывания метода в компоненте авторизации в качестве ключа авторизации используется никнейм
      if (username.length && this.loginKey !== 'email') {
        let message = '',
          charsToRemove = '',
          chars;

        // Выражение ищет пробелы в начале и конце никнейма. Пробелы между буквами в никнейме разрешены
        const spaces = /^\s|\s$/g.test(username);
        if (spaces) {
          message += 'Пробелы в начале и конце никнейма запрещены\n';
        }

        // Запрещенные символы
        const forbiddenChars = /@|~|`|'|"|\/|\\|\|/g;

        // Проверяем строку на наличие запрещенных символов. Проверка длится до конца строки
        while ((chars = forbiddenChars.exec(username))) {
          // Найденный символ дописываем в переменную charsToRemove только в том случае, если конкретно его там еще нет.
          if (charsToRemove.indexOf(chars[0]) === -1) {
            charsToRemove += `${chars[0]} `;
          }
        }

        // Меньше трех (т.е. 2 символа) так как в строку символ добавляется с пробелом
        if (charsToRemove.length && charsToRemove.length < 3)
          message += `Символ ${charsToRemove}запрещен`;
        else if (charsToRemove.length >= 3) {
          message += `Символы ${charsToRemove}запрещены`;
        }

        if (spaces || charsToRemove.length) {
          this.usernameError = true;
          this.usernameErrorMessage = message;
        } else {
          if (page === 'signup') this.checkUsername(username, page);
        }
      }

      this.loading.username = false;
    }, 1500),

    /**
     * Валидируем email адрес пользователя. В email адресе запрещены только пробелы
     *
     * @param {String} email    Указанный пользователем email
     * @param {String} page     Параметр, определяющий источник вызова метода (компонент). По умолчанию предполагается, что метод вызван на странице регистрации.
     *                          Со страниц логина и восстановления доступа вызывается со значениями 'signin' и 'repair' соответственно
     */
    validateEmail: debounce(function(email, page = 'signup') {
      this.emailError = false;
      this.emailErrorMessage = '';

      // Начинаем валидацию только:
      // 1. Если передано какое-то значение, а не пустая строка
      // 2. Если на момент начала срабатывания метода в компоненте авторизации в качестве ключа авторизации используется email адрес
      if (email.length && this.loginKey !== 'username') {
        let message = '';
        const spaces = /\s/g.test(email);
        if (spaces) {
          message += 'Пробелы запрещены\n';
        }

        const pattern = /@+\w{1,}\.\w{2,}/g.test(email);
        if (!pattern) {
          message += 'Неверный формат email адреса';
        }

        if (spaces || !pattern) {
          this.emailError = true;
          this.emailErrorMessage = message;
        } else {
          if (page !== 'signin') this.checkEmail(email, page);
        }
      }

      this.loading.email = false;
    }, 1500),

    /**
     * Валидируем пароль пользователя. Запрещены только пробелы
     *
     * @param {String} password   Указанный пользователем пароль
     */
    validatePassword(password) {
      this.passwordError = false;
      this.passwordErrorMessage = '';

      let message = '';
      const spaces = /\s/g.test(password);

      if (spaces) {
        message += 'Пробелы запрещены';
        this.passwordError = true;
        this.passwordErrorMessage = message;
      }
      return;
    },

    /**
     * Валидируем ключ подтверждения для восстановления пользователю доступа к аккаунту
     *
     * @param {String} key        Указанный пользователем никнейм
     */
    validateRepairKey: debounce(function(key) {
      this.repairKeyError = false;
      this.repairKeyErrorMessage = '';

      const pattern = /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/gi.test(key);

      if (!pattern) {
        this.repairKeyError = true;
        this.repairKeyErrorMessage = 'Неверный ключ подтверждения';
      }

      this.loading.repair = false;
      return;
    }, 1500),

    /**
     * Если нет ошибок и поля с никнеймом или почтовым адресом не в процессе валидации - форма заполнила корректно
     */
    validateForm() {
      return this.loading.username ||
        this.loading.email ||
        this.usernameError ||
        this.emailError ||
        this.passwordError
        ? false
        : true;
    },

    /**
     * Проверяем свободен ли указанный при регистрации пользователем никнейм
     *
     * @param {String} username   Указанный никнейм
     * @param {String} page       Страница, вызвавшая метод
     */
    checkUsername(username, page) {
      this.$axios
        .post('/users/check/username', { username })
        .then(res => {
          if (res.data) {
            this.usernameError = true;
            this.usernameErrorMessage = `Никнейм ${res.data} уже используется другим пользователем`;
          }
          return;
        })
        .catch(e => {
          throw e;
        });
    },

    /**
     * Проверяем свободен ли указанный при регистрации пользователем email адрес
     *
     * @param {String} email    Указанный адрес электронной почты
     * @param {String} page     Страница, вызвавшая метод
     */
    checkEmail(email, page) {
      this.$axios
        .post('/users/check/email', { email })
        .then(res => {
          if (res.data && page === 'signup') {
            this.emailError = true;
            this.emailErrorMessage = `Адрес ${res.data} уже используется другим пользователем`;
          } else if (!res.data && page === 'repair') {
            this.emailError = true;
            this.emailErrorMessage = `Пользователь с данным адресом не найден`;
          }
        })
        .catch(e => {
          throw e;
        });
    },

    /**
     * Обрабатываем ошибки, полученные в результате отправки формы
     *
     * @param {Object} e        Экземпляр ошибки
     */
    handleErrors(e) {
      // Описанные на стороне сервера ошибки
      if (e.response) {
        if (e.response.data.username) {
          this.usernameError = true;
          this.usernameErrorMessage = e.response.data.usernameErrorMessage;
        }
        if (e.response.data.email) {
          this.emailError = true;
          this.emailErrorMessage = e.response.data.emailErrorMessage;
        }
        if (e.response.data.password) {
          this.passwordError = true;
          this.passwordErrorMessage = e.response.data.passwordErrorMessage;
        }
        if (e.response.data.name === 'Invalid repair key') {
          this.repairKeyError = true;
          this.repairKeyErrorMessage = e.response.data.message;
        }

        if (e.response.data.name === 'Repair key not found') {
          this.repairKeyError = true;
          this.repairKeyErrorMessage = e.response.data.message;
        }

        if (e.response.data.name === 'Database connection failed') {
          this.errorNotify(e.response.data.message);
        }

        if (e.response.data.name === 'Operation failed') {
          this.errorNotify(e.response.data.message);
        }
      }

      // Сгенерированные сервером/браузером ошибки
      if (e.message === 'Network Error') {
        this.errorNotify(
          'Не удалось связаться с сервером. Проверьте свое соединение с интернетом и попробуйте снова'
        );
      }
    },

    /**
     * Вызов оповещения об ошибке
     *
     * @param {String} message   Текст ошибки
     */
    errorNotify(message) {
      this.$q.notify({
        color: 'negative',
        position: 'bottom',
        icon: 'fas fa-exclamation',
        message,
      });
    },
  },
};
