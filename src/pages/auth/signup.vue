<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
import dateAPI from "handlers/date";
export default {
  name: "registrationPage",

  meta() {
    return {
      title: this.$t("titles.authSignup"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  async beforeMount() {
    const lang = this.lang;
    this.tz = await dateAPI.isTimezoneInList(lang);
  },

  data() {
    return {
      tz: null,
      countryISO: null,
      lang: this.$store.state.user.language,

      username: "",
      email: "",
      password: "",

      usernameError: false,
      emailError: false,
      passwordError: false,

      usernameErrorMessage: "",
      emailErrorMessage: "",
      passwordErrorMessage: "",

      loading: {
        username: false,
        email: false,
        submit: false
      },

      hidePwd: true
    };
  },

  computed: {
    /**
     * Компонуем экземпляр данных авторизации пользователя для отправки на сервер
     */
    credentials() {
      return {
        username: this.username,
        email: this.email,
        password: this.password,
        metadata: {
          data: {
            country: this.countryISO,
            timezone: this.tz,
            language: this.lang
          }
        }
      };
    },

    /**
     * Проверяем готовность формы к отправке.
     * Если все поля заполнены и соблюдены нормы по длине никнейма и пароля - запускаем метод валидации формы.
     */
    canSubmit() {
      if (
        !this.username.length ||
        this.username.length > 16 ||
        !this.email.length ||
        (this.password.length < 7 || this.password.length > 30) ||
        this.loading.username ||
        this.loading.email ||
        this.usernameError ||
        this.emailError ||
        this.passwordError
      ) {
        return false;
      } else {
        return true;
      }
    }
  },

  methods: {
    async submit() {
      this.loading.submit = true;

      let credentials = this.credentials;
      this.countryISO = await userAPI.getCountry();

      const { user, error } = await userAPI.signup(this.credentials);
      this.loading.submit = false;

      if (error) {
        const { errorType, message } = controllers.handleErrors(error);
        this[errorType] = true;
        this[`${errorType}Message`] = message;

        return;
      }

      this.$store.commit("user/setUser", user);

      // Проверяем наличие параметра переадресации в текущем роуте.
      // Если он есть - перенаправляем пользователя на указанный маршрут. В противном случае отправляем на главную страницу
      const redirectTo = this.$route.params.redirect;
      const to = redirectTo ? redirectTo : "home";
      this.$router.replace({ name: to });
    }
  },

  watch: {
    username: debounce(async function(username) {
      this.usernameError = false;
      this.usernameErrorMessage = "";

      if (username.length) {
        const { message } = await controllers.checkUsername(username);
        if (message) {
          this.usernameError = true;
          this.usernameErrorMessage = message;
        }
      }

      this.loading.username = false;
    }, 1500),

    email: debounce(async function(email) {
      this.emailError = false;
      this.emailErrorMessage = "";

      if (email.length) {
        const { message } = await controllers.checkEmail(email);
        if (message) {
          this.emailError = true;
          this.emailErrorMessage = message;
        }
      }

      this.loading.email = false;
    }, 1500)
  },

  render(h) {
    return h("q-page", [
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
          h(
            "q-input",
            {
              attrs: {
                autofocus: true,
                autocomplete: false,
                maxlength: "16",
                value: this.username,
                label: this.$t("labels.username"),
                hint: this.$t("hints.auth.username"),
                counter: true,
                error: this.usernameError,
                errorMessage: this.usernameErrorMessage,
                loading: this.loading.username
              },
              on: {
                input: value => {
                  this.username = value;
                  this.loading.username = true;
                }
              }
            },
            [
              h("q-spinner-puff", {
                props: {
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
          ),
          h(
            "q-input",
            {
              attrs: {
                autocomplete: false,
                type: "email",
                value: this.email,
                label: this.$t("labels.email"),
                hint: this.$t("hints.auth.email"),
                error: this.emailError,
                errorMessage: this.emailErrorMessage,
                loading: this.loading.email
              },
              on: {
                input: value => {
                  this.email = value;
                  this.loading.email = true;
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
                hint: this.$t("hints.auth.password"),
                counter: true,
                error: this.passwordError,
                errorMessage: this.passwordErrorMessage
              },
              on: {
                input: value => {
                  this.passwordError = false;
                  this.passwordErrorMessage = "";

                  this.password = value;
                  this.passwordErrorMessage = controllers.validatePassword(
                    value
                  );

                  if (this.passwordErrorMessage) {
                    this.passwordError = true;
                  }
                }
              }
            },
            [
              h("q-icon", {
                staticClass: "cursor-pointer q-ml-sm",
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
                    this.password.length < 7 ? "fas fa-unlock" : "fas fa-lock"
                },
                slot: "prepend"
              })
            ]
          ),
          h(
            "q-btn",
            {
              staticClass: "float-right q-my-xl",
              class: {
                loading: this.loading.submit
              },
              attrs: {
                type: "submit",
                label: this.$t("labels.signup"),
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
          )
        ]
      )
    ]);
  }
};
</script>