<script>
import date from "handlers/date";

export default {
  name: "oauthProvidersList",
  beforeMount() {
    if (process.env.CLIENT) {
      import("boot/oAuth").then(data => {
        this.oauth = data.default;
        let fbAccesToken;
        // Загружаем и инициализируем SDK
        // this.oauth.facebook.load().then(fb => {
        //   fb.getLoginStatus(res => {
        //     if (res.status === "connected") {
        //       FB.api(
        //         `/${this.user.metadata.facebookID}/`,
        //         {
        //           fields: "id,first_name,last_name,email,link"
        //         },
        //         response => {
        //           this.facebookProfile = response;
        //         }
        //       );
        //     }
        //   });
        // });

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
      oauth: {}
    };
  },

  computed: {
    isFacebookLinked() {
      let message;
      if (this.user.metadata.facebookID) {
        message = this.$t("labels.fbLinked");
      } else {
        message += "Вы можете привязать к аккаунту свою страничку facebook";
      }

      return message;
    }
  },

  methods: {
    facebookData(h) {
      let dataNodes = [];
      if (this.user.metadata.facebookID) {
        dataNodes.push(
          h("q-item-label", { attrs: { caption: true } }, [
            h("span", this.user.metadata.facebookData.name),
            h(
              "span",
              { staticClass: "dot-separate cursor-pointer dashed" },
              "Update"
            )
          ]),
          h("q-item-label", [
            h(
              "span",
              `${this.$t("labels.connected")}: ${date.dateFromIso(
                this.user.metadata.facebookData.approved
              )}`
            )
          ])
        );
      }

      const connectButtonLabel = this.user.metadata.facebookID
        ? this.$t("labels.disconnectProvider")
        : this.$t("labels.connectProvider");

      return {
        data: [
          h(
            "q-item-label",
            { attrs: { caption: true } },
            this.isFacebookLinked
          ),
          h("q-item-label", { attrs: { caption: true } }, dataNodes)
        ],
        connectButtonLabel
      };
    }
  },

  render(h) {
    return h("div", { staticClass: "form column" }, [
      h("q-list", { attrs: { padding: true } }, [
        h(
          "q-item-label",
          { attrs: { header: true } },
          "Third-party authorization apps"
        ),
        h("q-item", [
          h("q-item-section", { attrs: { avatar: true } }, [
            h("q-icon", {
              attrs: { color: "primary", name: "mdi-facebook" }
            })
          ]),
          h("q-item-section", [
            h("q-item-label", "Facebook"),
            this.facebookData(h).data
          ]),
          h(
            "q-item-section",
            { attrs: { side: true } },
            this.facebookData(h).connectButtonLabel
          )
        ])
      ])
    ]);
  }
};
</script>
