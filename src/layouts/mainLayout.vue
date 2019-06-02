<script>
import { mapState, mapGetters } from "vuex";
import userMenu from "component/ui/userMenu";
export default {
  name: "mainLayout",
  components: {
    userMenu
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      user: state => state.user.user
    }),

    // ...mapGetters({ user: "user/getUser" }),

    __routeTabs() {
      const tabs = [
        { to: "/", label: "Главная" },
        { to: "/rb", label: "Рейдовые боссы" },
        { to: "/forum", label: "Форум" }
      ];

      if (!this.user)
        tabs.push(
          { to: "/auth/signup", label: "Регистрация" },
          { to: "/auth/signin", label: "Логин" }
        );

      return tabs;
    }
  },
  methods: {
    __getRouteTabs(h) {
      return h(
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
      );
    },

    __getRightTabs(h) {
      return [
        h("q-space"),
        h("q-tabs", { props: { align: "right" } }, [
          h("q-avatar", [
            h("img", {
              attrs: { src: "statics/avatar.png" }
            }),
            h("userMenu", { props: { user: this.user } })
          ])
        ])
      ];
    }
  },

  render(h) {
    return h("q-layout", { props: { view: "lHh lpR fFf" } }, [
      h(
        "q-header",
        {
          attrs: {
            elevated: true,
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
      ),
      h("q-page-container", [h("router-view")])
    ]);
  }
};
</script>