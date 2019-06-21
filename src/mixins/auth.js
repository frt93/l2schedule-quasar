import { debounce } from 'quasar';
import api from 'handlers/user/api';
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
      newPasswordError: false,

      usernameErrorMessage: '',
      emailErrorMessage: '',
      passwordErrorMessage: '',
      newPasswordErrorMessage: '',

      loading: {
        username: false,
        email: false,
        repair: false,
        submit: false,
      },
    };
  },

  methods: {
    /**
     * Валидируем никнейм пользователя
     *
     * @param {String} username   Указанный пользователем никнейм
     * @param {Boolean} check     Параметр, определяющий стоит ли проверять существование пользователя с указанным username перед отправкой формы
     */
    validateUsername: debounce(function(username, check = true) {
      this.usernameError = false;
      this.usernameErrorMessage = '';

      // Начинаем валидацию только:
      // 1. Если передано какое-то значение, а не пустая строка
      // 2. Если на момент начала срабатывания метода в компоненте авторизации в качестве ключа авторизации используется никнейм
      if (username.length && this.loginKey !== 'email') {
        let message = '',
          charsToRemove = '',
          chars;

        // Выражение ищет пробелы в никнейме
        const spaces = /\s/g.test(username);
        if (spaces) {
          message += `${this.$t('errors.spaces')}\n`;
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
          message += `${this.$t('errors.char')} ${charsToRemove}`;
        else if (charsToRemove.length >= 3) {
          message += `${this.$t('errors.chars')} ${charsToRemove}`;
        }

        if (spaces || charsToRemove.length) {
          this.usernameError = true;
          this.usernameErrorMessage = message;
        } else {
          if (check) this.checkUsername(username);
        }
      }

      this.loading.username = false;
    }, 1500),

    /**
     * Валидируем email адрес пользователя. В email адресе запрещены только пробелы
     *
     * @param {String} email    Указанный пользователем email
     * @param {Boolean} check   Параметр, определяющий стоит ли проверять существование пользователя с указанным email адресом перед отправкой формы
     */
    validateEmail: debounce(function(email, check = true) {
      this.emailError = false;
      this.emailErrorMessage = '';

      // Начинаем валидацию только:
      // 1. Если передано какое-то значение, а не пустая строка
      // 2. Если на момент начала срабатывания метода в компоненте авторизации в качестве ключа авторизации используется email адрес
      if (email.length && this.loginKey !== 'username') {
        let message = '';
        const spaces = /\s/g.test(email);
        if (spaces) {
          message += `${this.$t('errors.spaces')}\n`;
        }

        const pattern = /@+\w{1,}\.\w{2,}/g.test(email);
        if (!pattern) {
          message += this.$t('errors.wrongEmail');
        }

        if (spaces || !pattern) {
          this.emailError = true;
          this.emailErrorMessage = message;
        } else {
          if (check) this.checkEmail(email);
        }
      }

      this.loading.email = false;
    }, 1500),

    /**
     * Валидируем пароль пользователя. Запрещены только пробелы
     *
     * @param {String} password      Указанный пользователем пароль
     * @param {String} newPassword   Новый пароль пароль пользователя (передается в компоненте смены пароля)
     */
    validatePassword(password, newPassword) {
      this.passwordError = false;
      this.passwordErrorMessage = '';

      if (newPassword) {
        this.newPasswordError = false;
        this.newPasswordErrorMessage = '';
      }

      let message = '';
      const spaces = /\s/g.test(password);

      if (spaces) {
        message += `${this.$t('errors.spaces')}\n`;
        if (newPassword) {
          this.newPasswordError = true;
          this.newPasswordErrorMessage = message;
          return;
        }
        this.passwordError = true;
        this.passwordErrorMessage = message;
      }
      return;
    },

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
     */
    async checkUsername(username) {
      const { error } = await api.checkUsername(username);
      if (error) this.handleErrors(error);
    },

    /**
     * Проверяем свободен ли указанный при регистрации пользователем email адрес
     *
     * @param {String} email    Указанный адрес электронной почты
     */
    async checkEmail(email) {
      const { error } = await api.checkEmail(email);
      if (error) this.handleErrors(error);
    },

    /**
     * Обрабатываем ошибки, полученные в результате отправки формы
     *
     * @param {Object} e        Экземпляр ошибки
     */
    handleErrors(e) {
      /**
       * Описанные на стороне сервера кастомные ошибки.
       * У них задано свойство type, совпадающее с наименованием свойств data, отвечающих за выброс ошибок.
       * Свойство msgType совпадает с наименованием свойст data, хранящих в себе текст ошибок
       */

      if (e.response) {
        const err = e.response.data;
        const status = e.response.status;
        if (err.type === 'usernameError' || 'emailError' || 'passwordError' || 'repairKeyError') {
          this[err.type] = true;
          this[err.msgType] = err.message;
        }

        if (status >= 500) {
          this.errorNotify(err.message);
        }
      }

      // Сгенерированные сервером/браузером ошибки
      if (e.message === 'Network Error') {
        this.errorNotify(this.$t('errors.network'));
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

    /**
     * Вызов оповещения об успешном завершении операции
     *
     * @param {String} message   Текст оповещения
     */
    successNotify(message) {
      this.$q.notify({
        color: 'green-6',
        position: 'bottom-right',
        icon: 'far fa-smile-wink',
        message,
      });
    },
  },
};
