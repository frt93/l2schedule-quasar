<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
// import oauth from "boot/oAuth";
import { axiosInstance } from "boot/axios";

export default {
  name: "loginPage",
  meta() {
    return {
      title: this.$t("titles.authSignin"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  beforeMount() {
    if (process.env.CLIENT) {
      import("boot/oAuth").then(data => {
        this.oauth = data.default;
        const { script } = this.oauth.telegram();
        this.$refs.providers.appendChild(script);
      });
    }
  },

  data() {
    return {
      login: "",
      password: "",
      loginError: false,
      loginErrorMessage: "",
      passwordError: false,
      passwordErrorMessage: "",
      hidePwd: true,
      loading: false,
      sending: false,
      oauth: null
    };
  },

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
     * Если все поля заполнены, соблюдены нормы по длине никнейма (или паттерну email адреса) и пароля, а также отсутствуют ошибки - можно отправлять
     */
    canSubmit() {
      if (
        !this.login.length ||
        (this.password.length < 7 || this.password.length > 30) ||
        (this.loginKey === "username" && this.login.length > 16) ||
        this.loginError ||
        this.passwordError ||
        this.loading
      ) {
        return false;
      } else {
        return true;
      }
    }
  },
  methods: {
    google() {
      let user;
      this.oauth.google
        .signIn()
        .then(GoogleUser => {
          const profile = GoogleUser.getBasicProfile();
          user = {
            id: profile.getId(),
            email: profile.getEmail(),
            avatar: profile.getImageUrl(),
            name: profile.getName()
          };
          console.log(user);
        })
        .catch(error => {
          //on fail do something
        });
    },
    fb() {
      let user;
      this.oauth.facebook.login().then(res => {
        console.log(res);
      });
    },
    telegram() {
      return TWidgetLogin.auth();
    },
    async submit() {
      this.sending = true;
      const { user, error } = await userAPI.signin(this.credentials);
      this.sending = false;

      if (error) {
        const { errorType, message } = controllers.handleErrors(
          error,
          "signin"
        );

        this[errorType] = true;
        this[`${errorType}Message`] = message;

        return;
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
    login: debounce(function(newValue) {
      this.loginError = this.passwordError = false;
      this.loginErrorMessage = this.passwordErrorMessage = "";

      if (this.loginKey === "username") {
        this.loginErrorMessage = controllers.validateUsername(newValue, false);
      } else {
        this.loginErrorMessage = controllers.validateEmail(newValue, false);
      }

      if (this.loginErrorMessage) {
        this.loginError = true;
      }

      this.loading = false;
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
                maxlength: this.loginKey === "username" ? 16 : "",
                value: this.login,
                label: this.$t("labels.login"),
                counter: this.loginKey === "username" ? true : false,
                error: this.loginError,
                errorMessage: this.loginErrorMessage,
                loading: this.loading
              },
              on: {
                input: value => {
                  this.loading = true;
                  this.login = value;
                }
              }
            },
            [
              h("q-spinner-puff", {
                attrs: {
                  color: this.loginError ? "negative" : "primary"
                },
                slot: "loading"
              }),
              h("q-icon", {
                attrs: {
                  name:
                    this.loginKey === "username"
                      ? "fas fa-user-alt"
                      : "fas fa-envelope"
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
                  loading: this.sending
                },
                attrs: {
                  type: "submit",
                  label: this.$t("labels.signin"),
                  color: this.canSubmit ? "green-6" : "red-6",
                  loading: this.sending,
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
            }),
            h("div", { ref: "providers" }, [
              h("q-btn", {
                staticClass: "float-left",
                attrs: {
                  label: "google",
                  color: "yellow-4"
                },
                on: {
                  click: () => {
                    this.google();
                  }
                }
              }),
              h("q-btn", {
                staticClass: "float-left",
                attrs: {
                  label: "fb",
                  color: "yellow-4"
                },
                on: {
                  click: () => {
                    this.fb();
                  }
                }
              })
            ])
          ])
        ]
      )
    ]);
  }
};
</script>