<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
import chooseUsername from "./oauthChooseUsername";
export default {
  name: "oauthComponent",

  beforeCreate() {
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
      oauth: null
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
    fb() {
      this.oauth.facebook.login().then(res => {
        const user = controllers.facebookInstance(res);
        console.log(user);
      });
    },
    telegram(res) {
      const user = controllers.telegramInstance(res);
      console.log(user);
    },
    vk() {
      this.oauth.vk.login().then(res => {
        const user = controllers.vkInstance(res);
        console.log(user);
      });
    },

    async oauthLogin(credentials) {
      const { user, error } = await userAPI.oauthLogin(credentials);

      if (error) {
        const { errorType, message } = controllers.handleErrors(error);

        if (errorType === "oauth: no user") {
          this.oauthRegister(credentials);
        }

        return;
      }

      this.$store.dispatch("user/signin", user);
      // Проверяем наличие параметра переадресации в текущем роуте.
      // Если он есть - перенаправляем пользователя на указанный маршрут. В противном случае отправляем на главную страницу
      const redirectTo = this.$route.params.redirect;
      const to = redirectTo ? redirectTo : "home";
      this.$router.replace({ name: to });
    },

    async oauthRegister(credentials) {
      //@todo Добавить определение страны, часового пояса и языка
      const { user, error } = await userAPI.oauthRegister(credentials);

      if (error) {
        const { errorType, message } = controllers.handleErrors(error);
        if (errorType === "oauth: email already used") {
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
          this.$q
            .dialog({
              title: "One moment, please",
              component: chooseUsername,

              // optional if you want to have access to
              // Router, Vuex store, and so on, in your
              // custom component:
              root: this.$root,
              message
            })
            .onOk(async () => {});
        }
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
            label: "fb",
            color: "yellow-4"
          },
          on: {
            click: () => {
              this.fb();
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