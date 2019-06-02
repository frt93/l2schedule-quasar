<script>
import auth from "mixin/auth";
export default {
  name: "loginComponent",
  mixins: [auth],
  computed: {
    /**
     * Определяем какой ключ для авторизации использует пользователь: никнейм или email адрес
     */
    loginKey() {
      const hasAt = this.login.indexOf("@") > -1;
      return hasAt ? "email" : "username";
    },

    /**
     * Компонуем данные авторизации
     */
    credentials() {
      let credentials = { password: this.password };
      this.loginKey === "email"
        ? (credentials.email = this.login)
        : (credentials.username = this.login);
      return credentials;
    },

    /**
     * Проверяем готовность формы к отправке.
     * Если все поля заполнены и соблюдены нормы по длине никнейма (или паттерну email адреса) и пароля - запускаем метод валидации формы.
     */
    canSubmit() {
      if (
        !this.login.length ||
        (this.password.length < 7 || this.password.length > 30) ||
        (this.loginKey === "username" && this.login.length > 16)
      ) {
        return false;
      } else {
        return this.validateForm();
      }
    }
  },
  methods: {
    submit() {
      this.$store
        .dispatch("auth/signIn", this.credentials)
        .then(res => {
          this.$router.push({ name: "main" });
        })
        .catch(e => {
          this.handleErrors(e);
        });
    }
  },

  watch: {
    /**
     * Отслеживаем значение переменной логина и трансформируем инпут в зависимости от выбранного пользователем ключа авторизации
     */
    login(newValue) {
      if (this.loginKey === "username") {
        this.emailError = false;
        this.emailErrorMessage = "";
        this.loading.username = true;
        this.validateUsername(newValue, "sigin");
      } else {
        this.usernameError = false;
        this.usernameErrorMessage = "";
        this.loading.email = true;
        this.validateEmail(newValue, "signin");
      }
    }
  },

  render(h) {
    return h(
      "div",
      {
        class: "q-pa-md"
      },
      [
        h(
          "q-form",
          {
            class: "q-gutter-md",
            attrs: {
              autocomplete: false
            },
            on: {
              submit: () => {
                this.submit();
              }
            }
          },
          [
            this.loginKey === "username"
              ? h(
                  "q-input",
                  {
                    attrs: {
                      key: "username",
                      autofocus: true,
                      autocomplete: false,
                      value: this.login,
                      label: "Логин",
                      hint: "Ваш никнейм или email адрес",
                      error: this.usernameError,
                      errorMessage: this.usernameErrorMessage,
                      loading: this.loading.username
                    },
                    on: {
                      input: value => {
                        this.login = value;
                      }
                    }
                  },
                  [
                    h("q-spinner-puff", {
                      attrs: {
                        color: this.usernameError ? "negative" : "primary"
                      },
                      slot: "loading"
                    }),
                    h("q-icon", {
                      attrs: {
                        name: "fas fa-user-alt"
                      },
                      slot: "prepend"
                    })
                  ]
                )
              : h(
                  "q-input",
                  {
                    attrs: {
                      key: "email",
                      autocomplete: false,
                      value: this.login,
                      label: "Логин",
                      hint: "Ваш никнейм или email адрес",
                      error: this.emailError,
                      errorMessage: this.emailErrorMessage,
                      loading: this.loading.email
                    },
                    on: {
                      input: value => {
                        this.login = value;
                      }
                    }
                  },
                  [
                    h("q-spinner-puff", {
                      attrs: {
                        color: this.emailError ? "negative" : "primary"
                      },
                      slot: "loading"
                    }),
                    h("q-icon", {
                      attrs: {
                        name: "fas fa-envelope"
                      },
                      slot: "prepend"
                    })
                  ]
                ),
            h(
              "q-input",
              {
                attrs: {
                  autocomplete: false,
                  maxlength: "30",
                  type: this.hidePwd ? "password" : "text",
                  value: this.password,
                  label: "Пароль",
                  error: this.passwordError,
                  errorMessage: this.passwordErrorMessage
                },
                on: {
                  input: value => {
                    this.password = value;
                    this.validatePassword(value);
                  }
                }
              },
              [
                h("q-icon", {
                  class: "cursor-pointer q-ml-sm",
                  slot: "append",
                  attrs: {
                    name: this.hidePwd ? "fas fa-eye" : "fas fa-eye-slash"
                  },
                  on: {
                    click: () => {
                      this.hidePwd = !this.hidePwd;
                    }
                  }
                }),
                h("q-icon", {
                  attrs: {
                    name:
                      this.password.length < 7 || this.passwordError
                        ? "fas fa-unlock"
                        : "fas fa-lock"
                  },
                  slot: "prepend"
                })
              ]
            ),
            h("q-btn", {
              class: "float-right q-my-xl",
              attrs: {
                label: "Войти",
                type: "submit",
                color: this.canSubmit ? "green-6" : "red-6",
                disabled: !this.canSubmit
              }
            }),
            h("q-btn", {
              class: "float-left q-mt-xl",
              attrs: {
                label: "Забыли пароль?",
                color: "yellow-7"
              },
              on: {
                click: () => {
                  this.$router.push({ name: "repair" });
                }
              }
            })
          ]
        )
      ]
    );
  }
};
</script>