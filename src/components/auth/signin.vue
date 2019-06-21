<script>
import auth from "mixin/auth";
import api from "handlers/user/api";
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
    async submit() {
      this.loading.submit = true;
      const { user, error } = await api.signin(this.credentials);
      this.loading.submit = false;
      if (error) {
        return this.handleErrors(error);
      }
      this.$store.dispatch("user/signin", user);

      // Проверяем наличие параметра переадресации в текущем роуте.
      // Если он есть - перенаправляем пользователя на указанный маршрут. В противном случае отправляем на главную страницу
      const redirectTo = this.$route.params.redirect;
      const to = redirectTo ? redirectTo : "home";
      this.$router.replace({ name: to });
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
        this.validateUsername(newValue, false);
      } else {
        this.usernameError = false;
        this.usernameErrorMessage = "";
        this.loading.email = true;
        this.validateEmail(newValue, false);
      }
    }
  },

  render(h) {
    return h(
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
                  label: this.$t("labels.login"),
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
                  label: this.$t("labels.login"),
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
              label: this.$t("labels.password"),
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
        h("div", { staticClass: "q-my-md" }, [
          h(
            "q-btn",
            {
              staticClass: "float-right",
              class: {
                loading: this.loading.submit
              },
              attrs: {
                type: "submit",
                label: this.$t("labels.signin"),
                color: this.canSubmit ? "green-6" : "red-6",
                loading: this.loading.submit,
                disable: !this.canSubmit
              }
            },
            [
              h(
                "div",
                {
                  slot: "loading"
                },
                [this._v(this.$t("labels.sending")), h("q-spinner-dots")]
              )
            ]
          ),
          h("q-btn", {
            staticClass: "float-left",
            attrs: {
              label: this.$t("labels.forgot"),
              color: "yellow-7"
            },
            on: {
              click: () => {
                this.$router.push({ name: "repair" });
              }
            }
          })
        ])
      ]
    );
  }
};
</script>