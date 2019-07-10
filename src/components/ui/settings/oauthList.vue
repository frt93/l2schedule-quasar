<script>
export default {
  name: "oauthProvidersList",
  beforeMount() {
    if (process.env.CLIENT) {
      import("boot/oAuth").then(data => {
        this.oauth = data.default;
        let fbAccesToken;
        // Загружаем и инициализируем SDK
        this.oauth.facebook.load().then(fb => {
          fb.getLoginStatus(res => {
            if (res.status === "connected") {
              FB.api(
                `/${this.user.metadata.facebookID}/`,
                {
                  fields: "id,first_name,last_name,email,link"
                },
                response => {
                  this.facebookProfile = response;
                }
              );
            }
          });
        });

        // Инициализируем telegram виджет
        // const { script } = this.oauth.telegram();
        // this.$refs.providers.appendChild(script);
        // window.onTelegramAuth = this.telegram;
      });
    }
  },

  props: ["user"],
  data() {
    return {
      oauth: {},
      facebookProfile: null
    };
  },

  computed: {
    facebook() {
      let message = "";
      if (this.user.metadata.facebookID) {
        message += "Вы привязали к аккаунту свою страничку в facebook";
        if (this.facebookProfile !== null) {
          message += `\n ${this.facebookProfile.first_name} ${this.facebookProfile.last_name}`;
        }
      } else {
        message += "Вы можете привязать к аккаунту свою страничку facebook";
      }

      return message;
    }
  },

  methods: {
    getLinkedFacebookProfile(fb) {}
  },

  render(h) {
    return h("div", { staticClass: "form column" }, [
      h("q-list", { attrs: { padding: true } }, [
        h("q-item-label", { attrs: { header: true } }, "list header"),
        h("q-item", [
          h("q-item-section", { attrs: { avatar: true, top: true } }, [
            h("q-icon", {
              attrs: { color: "primary", name: "mdi-facebook" }
            })
          ]),
          h("q-item-section", [
            h("q-item-label", "Facebook"),
            h("q-item-label", { attrs: { caption: true } }, this.facebook)
          ]),
          h("q-item-section", { attrs: { side: true } }, ["Отвязать"])
        ])
      ])
    ]);
  }
};
</script>
