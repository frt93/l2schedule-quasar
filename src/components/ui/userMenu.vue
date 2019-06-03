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
      this.$store.dispatch("auth/logout", this.$router);
    }
  },

  render(h) {
    return h(
      "q-menu",
      {
        props: {
          anchor: "bottom right",
          self: "top right",
          autoClose: true
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
              class: this.user.metadata.emailVerification
                ? "bg-red-6 menu-link"
                : null,
              attrs: {
                to: { name: "settings" }
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

<style scoped>
.menu-link {
  color: #fff;
}
</style>
