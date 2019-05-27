import { debounce } from 'quasar';
export default {
  data() {
    return {
      usernameError: false,
      emailError: false,
      passwordError: false,
      usernameErrorMessage: '',
      emailErrorMessage: '',
      passwordErrorMessage: '',
      loading: {
        username: false,
        email: false,
      },
    };
  },

  methods: {
    /**
     * Валидируем никнейм пользователя
     *
     * @param username          Указанный пользователем никнейм
     */
    validateUsername: debounce(function(username) {
      this.usernameError = false;
      this.usernameErrorMessage = '';

      // Начинаем валидацию только если передано какое-то значение, а не пустая строка
      if (username.length) {
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
          this.usernameError = false;
          this.usernameErrorMessage = '';
          this.checkUsername(username);
        }
      }

      this.loading.username = false;
    }, 1500),

    /**
     * Валидируем email адрес пользователя. В email адресе запрещены только пробелы
     *
     * @param email             Указанный пользователем email
     */
    validateEmail: debounce(function(email) {
      this.emailError = false;
      this.emailErrorMessage = '';

      // Начинаем валидацию только если передано какое-то значение, а не пустая строка
      if (email.length) {
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
          this.emailError = false;
          this.emailErrorMessage = '';
          this.checkEmail(email);
        }
      }

      this.loading.email = false;
    }, 1500),

    /**
     * Валидируем пароль пользователя. Запрещены только пробелы
     *
     * @param password          Указанный пользователем пароль
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
     * @param username          Указанный никнейм
     */
    checkUsername(username) {
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
     * @param email             Указанный адрес электронной почты
     */
    checkEmail(email) {
      this.$axios
        .post('/users/check/email', { email })
        .then(res => {
          if (res.data) {
            this.emailError = true;
            this.emailErrorMessage = `Адрес ${email} уже используется другим пользователем`;
          }
        })
        .catch(e => {
          throw e;
        });
    },

    handleErrors(e) {
      if (e.username) {
        this.usernameError = true;
        this.usernameErrorMessage = e.usernameErrorMessage;
      }
      if (e.email) {
        this.emailError = true;
        this.emailErrorMessage = e.emailErrorMessage;
      }
      if (e.password) {
        this.passwordError = true;
        this.passwordErrorMessage = e.passwordErrorMessage;
      }
    },
  },
};
