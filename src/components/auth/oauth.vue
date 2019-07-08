<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
import dateAPI from "handlers/date";

import chooseUsername from "./oauthChooseUsername";
export default {
  name: "oauthComponent",

  async beforeMount() {
    const lang = this.lang;
    this.tz = await dateAPI.isTimezoneInList(lang);

    if (process.env.CLIENT) {
      import("boot/oAuth").then(data => {
        this.oauth = data.default;

        // Загружаем и инициализируем SDK
        this.oauth.install();

        // Инициализируем telegram виджет
        const { script } = this.oauth.telegram();
        this.$refs.providers.appendChild(script);
        window.onTelegramAuth = this.telegram;
      });
    }
  },

  data() {
    return {
      username: "",
      oauth: null,
      tz: null,
      lang: this.$store.state.user.language
    };
  },

  methods: {
    google() {
      this.oauth.google.login().then(async res => {
        const credentials = controllers.googleInstance(res);

        if (credentials) {
          this.oauthLogin(credentials);
        }
      });
    },
    facebook() {
      this.oauth.facebook.login().then(res => {
        const credentials = controllers.facebookInstance(res);

        if (credentials) {
          this.oauthLogin(credentials);
        }
      });
    },
    telegram(res) {
      const credentials = controllers.telegramInstance(res);

      if (credentials) {
        this.oauthLogin(credentials);
      }
    },
    vk() {
      this.oauth.vk.login().then(res => {
        const credentials = controllers.vkInstance(res);

        if (credentials) {
          this.oauthLogin(credentials);
        }
      });
    },

    async oauthLogin(credentials) {
      const { user, error } = await userAPI.oauthLogin(credentials);

      if (error) {
        const { errorType } = controllers.handleErrors(error);

        if (errorType === "oauth: no user") {
          return this.oauthRegister(credentials);
        }

        return;
      }

      this.dispatch(user);
    },

    async oauthRegister(credentials) {
      credentials.lang = this.lang;
      credentials.timezone = this.tz;

      if (!credentials.country) {
        credentials.country = await userAPI.getCountry();
      }

      const { user, error } = await userAPI.oauthRegister(credentials);

      if (error) {
        const { errorType, message } = controllers.handleErrors(error);
        if (errorType === "oauth: email already used") {
          // Полученный от oauth провайдера email уже занят
          this.$q
            .dialog({
              title: this.$t("errors.authError"),
              message,
              persistent: true,
              style: "width: 700px; max-width: 80vw"
            })
            .onOk(async () => {});
        }

        if (errorType === "oauth: username is not chosen") {
          // Не удалось подобрать пользователю никнейм
          this.$q
            .dialog({
              component: chooseUsername,
              root: this.$root,
              message
            })
            .onOk(username => {
              credentials.customUsername = username;
              this.oauthRegister(credentials);
            });
        }
      }

      this.dispatch(user);
    },

    dispatch(user) {
      if (typeof user === "object") {
        this.$store.dispatch("user/signin", user);
        // Проверяем наличие параметра переадресации в текущем роуте.
        // Если он есть - перенаправляем пользователя на указанный маршрут. В противном случае отправляем на главную страницу
        const redirectTo = this.$route.params.redirect;
        const to = redirectTo ? redirectTo : "home";
        this.$router.replace({ name: to });
      }
    }
  },

  render(h) {
    return h("div", [
      h("q-separator"),
      h("div", { staticClass: "row justify-center", ref: "providers" }, [
        h("q-btn", {
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
          attrs: {
            label: "facebook",
            color: "yellow-4"
          },
          on: {
            click: () => {
              this.facebook();
            }
          }
        }),
        h("q-btn", {
          attrs: {
            label: "vk",
            color: "yellow-4"
          },
          on: {
            click: () => {
              this.vk();
            }
          }
        })
      ])
    ]);
  }
};
</script>