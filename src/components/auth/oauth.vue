<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
import dateAPI from "handlers/date";
import oauth from "boot/oauth";

import chooseUsername from "./oauthChooseUsername";
export default {
  name: "oauthComponent",

  async beforeMount() {
    const lang = this.lang;
    this.tz = await dateAPI.isTimezoneInList(lang);

    if (process.env.CLIENT) {
      // Загружаем и инициализируем SDK
      oauth.install();

      // Инициализируем telegram виджет
      const { script } = oauth.telegram();
      this.$refs.providers.appendChild(script);
      window.onTelegramAuth = this.telegram;
    }
  },

  data() {
    return {
      username: "",
      tz: null,
      lang: this.$store.state.user.language
    };
  },

  methods: {
    google() {
      oauth.google.login().then(async res => {
        const credentials = controllers.googleInstance(res);

        if (credentials) {
          this.oauthLogin(credentials);
        }
      });
    },
    facebook() {
      oauth.facebook.login().then(res => {
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
      oauth.vk.login().then(res => {
        const credentials = controllers.vkInstance(res);

        if (credentials) {
          this.oauthLogin(credentials);
        }
      });
    },

    async oauthLogin(credentials) {
      const { user, party, error } = await userAPI.oauthLogin(credentials);

      if (error) {
        const { errorType } = controllers.handleErrors(error);

        if (errorType === "oauth: no user") {
          // Пользователь не найден. Значит зарегистрируем
          return this.oauthRegister({ provider: credentials });
        }

        return;
      }

      this.dispatch(user, party);
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

    dispatch(user, party) {
      if (typeof user === "object") {
        this.$store.dispatch("user/signin", user);
        if (party) {
          this.$store.commit("party/setUserParty", party);
        }
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