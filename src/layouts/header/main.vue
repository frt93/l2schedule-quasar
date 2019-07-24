<script>
import { mapState } from "vuex";
import userMenu from "components/ui/userMenu";
export default {
  name: "headerComponent",
  computed: {
    ...mapState({
      user: state => state.user.instance,
      userParty: state => state.party.userParty
    }),

    __routeTabs() {
      const tabs = [
        { to: "/", label: this.$t("tabs.routes.homepage") },
        { to: "/rb", label: this.$t("tabs.routes.rb") },
        { to: "/forum", label: this.$t("tabs.routes.forum") }
      ];

      if (!this.user)
        tabs.push(
          { to: "/auth/signup", label: this.$t("tabs.routes.signup") },
          { to: "/auth/signin", label: this.$t("tabs.routes.signin") }
        );

      return tabs;
    }
  },
  methods: {
    __getRouteTabs(h) {
      return h("div", [
        h(
          "q-tabs",
          { props: { align: "left" } },

          this.__routeTabs.map(function(tab) {
            return h(
              "q-route-tab",
              {
                attrs: {
                  to: tab.to,
                  exact: true,
                  ripple: true
                }
              },
              tab.label
            );
          })
        )
      ]);
    },

    __getRightTabs(h) {
      return [
        h("q-space"),
        h("q-tabs", { props: { align: "right" } }, [
          h("q-avatar", [
            h("img", {
              attrs: {
                src:
                  typeof this.user === "object" && this.user.metadata.avatar
                    ? this.user.metadata.avatar
                    : "statics/avatar.png"
              }
            }),
            h(userMenu, {
              props: { user: this.user, userParty: this.userParty }
            })
          ])
        ])
      ];
    }
  },

  render(h) {
    return h(
      "q-header",
      {
        attrs: {
          elevated: true,
          reveal: true,
          class: "bg-primary text-white"
        }
      },
      [
        h(
          "q-toolbar",
          this.user
            ? [this.__getRouteTabs(h), this.__getRightTabs(h)]
            : [this.__getRouteTabs(h)]
        )
      ]
    );
  }
};
</script>
