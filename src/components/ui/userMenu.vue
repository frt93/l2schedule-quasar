<script>
export default {
  name: "userDropdownMenu",
  props: ["user"],
  data() {
    return {
      uu: null
    };
  },

  methods: {
    logout() {
      this.$store.dispatch("user/logout", this.$router);
    },

    __party(h) {
      if (this.user.party) {
        return [
          h("q-separator"),
          h("q-item", { props: { clickable: true } }, [
            h(
              "q-item-section",
              {
                on: {
                  click: () => {
                    this.$router.push({
                      name: "party",
                      params: { name: this.user.party.name }
                    });
                  }
                }
              },
              this.user.party.name
            )
          ]),
          h("q-separator"),
          h("q-item", { props: { clickable: true } }, [
            h(
              "q-item-section",
              {
                on: {
                  click: () => {
                    this.$router.push({
                      name: "party",
                      params: { name: 'weda2' }
                    });
                  }
                }
              },
              'weda2'
            )
          ])
        ];
      }
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
        h("q-list", { attrs: { style: "min-width:150px" } }, [
          h("q-item", { props: { clickable: true } }, [
            h(
              "q-item-section",
              {
                on: {
                  click: () => {
                    this.$router.push({
                      name: "user",
                      params: { username: this.user.username }
                    });
                  }
                }
              },
              this.user.username
            )
          ]),
          h(
            "q-item",
            {
              class: this.user.safety.emailVerification
                ? "bg-red-6 menu-link"
                : null,
              attrs: {
                to: { name: "settings" }
              }
            },
            [h("q-item-section", this.$t("labels.settings"))]
          ),
          [this.__party(h)],
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
              this.$t("labels.logout")
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
