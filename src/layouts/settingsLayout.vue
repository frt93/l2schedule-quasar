

<script>
import mainheader from "components/ui/header/main";
import { mapState, mapGetters } from "vuex";
export default {
  name: "settingsLayout",
  components: { mainheader },

  async mounted() {
    this.isMiniToOverlay;
    const value = this.$q.localStorage.getItem("settingsDrawerMiniState");
    if (typeof value === "boolean" && !this.isMiniToOverlay) {
      //@todo
      this.miniState = value;
    }
  },

  data() {
    return {
      miniState: true,
      drawer: true
    };
  },

  watch: {
    miniState(newValue) {
      if (typeof newValue === "boolean" && !this.isMiniToOverlay) {
        this.$q.localStorage.set("settingsDrawerMiniState", newValue);
      }
    }
  },

  computed: {
    ...mapState({
      lang: state => state.user.language,
      languagesList: state => state.user.languagesList,
      timezoneList: state => state.user.timezoneList,
      countriesList: state => state.user.countriesList
    }),

    ...mapGetters({
      timezone: "user/timezone",
      user: "user/user"
    }),

    isMiniToOverlay() {
      console.log(this.$q.screen.width > 768);
      return this.$q.screen.width > 768 ? false : true;
    },

    routes() {
      return [
        {
          to: "settings/account",
          icon: "mdi-account-box",
          label: "tabs.settings.account"
        },
        {
          to: "settings/password",
          icon: "mdi-shield-lock",
          label: "tabs.settings.password"
        },
        {
          to: "settings/safety",
          icon: "mdi-security",
          label: "tabs.settings.safety"
        }
      ];
    }
  },

  methods: {
    logout() {
      this.$store.dispatch("user/logout", this.$router);
    },
    __routes(h) {
      let nodes = [];

      this.routes.forEach(route => {
        nodes.push(
          h(
            "q-item",
            {
              props: {
                clickable: true,
                to: { name: route.to },
                replace: true
              },
              on: {
                click: () => {
                  if (this.isMiniToOverlay) {
                    this.miniState = true;
                  }
                }
              }
            },
            [
              h("q-item-section", { attrs: { avatar: true } }, [
                h("q-icon", { attrs: { name: route.icon } })
              ]),
              h("q-item-section", this.$t(route.label)),
              this.__tooltip(h, route.label)
            ]
          )
        );
      });
      return nodes;
    },

    /**
     * Метод рендера тултипов
     *
     * @param message                Текст тултипа
     */
    __tooltip(h, message) {
      if (this.miniState) {
        return h("q-no-ssr", [
          h(
            "q-tooltip",
            {
              props: {
                anchor: "center right",
                self: "center left",
                transitionShow: "scale",
                transitionHide: "scale"
              }
            },
            this.$t(message)
          )
        ]);
      }
    }
  },

  render(h) {
    return h("q-layout", { attrs: { view: "hHh Lpr lff" } }, [
      h(mainheader),
      h(
        "q-drawer",
        {
          staticClass: "settings-drawer",
          attrs: {
            contentClass: "bg-grey-3",
            value: this.drawer,
            mini: this.miniState,
            miniToOverlay: this.isMiniToOverlay,
            width: 200,
            breakpoint: 50,
            "show-if-above": true,
            bordered: true
          }
        },
        [
          h("q-scroll-area", { staticClass: "fit" }, [
            h("q-list", { attrs: { padding: true } }, [
              h(
                "q-item",
                {
                  props: {
                    clickable: true
                  },
                  on: {
                    click: () => {
                      this.miniState = !this.miniState;
                    }
                  }
                },
                [
                  h("q-item-section", { attrs: { avatar: true } }, [
                    h("q-icon", {
                      attrs: {
                        name: this.miniState
                          ? "mdi-arrow-split-vertical"
                          : "mdi-arrow-collapse-left"
                      }
                    })
                  ]),
                  h("q-item-section", this.$t("labels.collapse")),
                  this.__tooltip(h, "labels.expand")
                ]
              ),
              h("q-separator"),
              this.__routes(h),
              h("q-separator"),
              h(
                "q-item",
                {
                  props: {
                    clickable: true
                  },
                  on: {
                    click: () => {
                      this.logout();
                    }
                  }
                },
                [
                  h("q-item-section", { attrs: { avatar: true } }, [
                    h("q-icon", {
                      attrs: {
                        name: "mdi-logout-variant"
                      }
                    })
                  ]),
                  h("q-item-section", this.$t("labels.logout")),
                  this.__tooltip(h, "labels.logout")
                ]
              )
            ])
          ])
        ]
      ),
      h("q-page-container", [
        h("q-page", { attrs: { padding: true } }, [
          h("router-view", {
            attrs: {
              userInstance: this.user,
              lang: this.lang,
              languagesList: this.languagesList,
              timezoneList: this.timezoneList,
              timezone: this.timezone,
              countriesList: this.countriesList
            }
          })
        ])
      ])
    ]);
  }
};
</script>

<style lang="stylus" scope>
.form {
  .q-field {
    margin-bottom: $spaces.md.y;
  }
}

.settings-drawer {
  .q-item__section--avatar {
    min-width: 0;
  }
}
</style>