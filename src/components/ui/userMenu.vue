<script>
export default {
  name: "userDropdownMenu",
  props: {
    user: {
      type: Object,
      required: true
    }
  },

  methods: {
    logout() {
      this.$store.dispatch("auth/logout");
    }
  },

  render(h) {
    return h(
      "q-menu",
      {
        props: {
          anchor: "bottom right",
          self: "top right"
        }
      },
      [
        h("q-list", { attrs: { style: "min-width:100px" } }, [
          h("q-item", { props: { clickable: true } }, [
            h("q-item-section", this.user.username)
          ]),
          h(
            "q-item",
            {
              class: this.user.metadata.emailVerification ? "bg-red-6" : null,
              attrs: {
                clickable: true
              }
            },
            [h("q-item-section", "Настройки")]
          ),
          h("q-separator"),
          h("q-item", { props: { clickable: true } }, [
            h(
              "q-item-section",
              {
                on: {
                  click: () => {
                    this.logout();
                  }
                }
              },
              "Log Out"
            )
          ])
        ])
      ]
    );
  }
};
</script>
