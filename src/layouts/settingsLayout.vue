<script>
import mainheader from "./header/main";
import date from "handlers/date";

import { mapState, mapGetters } from "vuex";
export default {
  name: "settingsLayout",
  components: { mainheader },

  data() {
    return {
      miniState: true,
      drawer: true,
      screenWidth: 0
    };
  },

  watch: {
    miniState(newValue) {
      if (typeof newValue === "boolean") {
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
      user: "user/user",
      dateFormat: "user/dateFormat"
    }),

    isMiniState() {
      let value = this.miniState;
      if (process.env.CLIENT && this.screenWidth > 767) {
        const storage = this.$q.localStorage.getItem("settingsDrawerMiniState");
        if (typeof storage === "boolean") {
          // Если ширина экрана > 767px - достанем значения из localStore
          value = this.miniState = storage;
        }
      }

      return value;
    },

    isMiniToOverlay() {
      return this.screenWidth > 767 ? false : true;
    },

    routes() {
      return [
        {
          to: "settings/account",
          icon: "mdi-account-details",
          label: "tabs.settings.account"
        },
        {
          to: "settings/password",
          icon: "mdi-shield-lock",
          label: "tabs.settings.password",
          alert: this.passwordAlert
        },
        {
          to: "settings/safety",
          icon: "mdi-security",
          label: "tabs.settings.safety",
          alert: this.safetyAlert
        }
      ];
    },

    safetyAlert() {
      let count = 0;

      if (this.user.safety.emailVerification) {
        count++;
      }
      if (!this.user.email) {
        count++;
      }

      return count;
    },
    passwordAlert() {
      let count = 0;

      if (this.user.password === null) {
        count++;
      }

      return count;
    }
  },

  methods: {
    onResize(sizes) {
      this.screenWidth = sizes.width;
    },

    logout() {
      this.$store.dispatch("user/logout", this.$router);
    },
    /**
     * Рендер баджа с оповещением кол-ва "ошибок" настроек
     */
    __tabAlert(h, alert) {
      if (alert > 0) {
        return h(
          "q-badge",
          { attrs: { color: "red-6", floating: true } },
          alert
        );
      }
    },
    __routes(h) {
      let nodes = [];

      this.routes.forEach(route => {
        nodes.push(
          h(
            "q-route-tab",
            {
              props: {
                to: { name: route.to },
                label: this.$t(route.label),
                icon: route.icon,
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
            [this.__tabAlert(h, route.alert), this.__tooltip(h, route.label)]
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
      if (this.miniToOverlay) {
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
      h("q-resize-observer", {
        attrs: { debounce: 0 },
        on: {
          resize: sizes => {
            this.onResize(sizes);
          }
        }
      }),
      h(
        "q-drawer",
        {
          staticClass: "settings-drawer",
          attrs: {
            contentClass: "bg-grey-2",
            value: this.drawer,
            mini: this.isMiniState,
            miniWidth: this.isMiniToOverlay ? 60 : 120,
            miniToOverlay: this.isMiniToOverlay,
            width: 200,
            breakpoint: 0
          }
        },
        [
          h("q-scroll-area", { staticClass: "fit" }, [
            h(
              "q-tabs",
              {
                staticClass: "settings-tabs",
                attrs: {
                  padding: true,
                  vertical: true,
                  noCaps: true,
                  inlineLabel: this.isMiniState ? false : true
                }
              },
              [
                h(
                  "q-tab",
                  {
                    props: {
                      icon: this.miniState ? "mdi-menu-open mdi-rotate-180" : "mdi-menu-left",
                      label: !this.miniState ? this.$t("labels.collapse") : ""
                    },
                    on: {
                      click: () => {
                        this.miniState = !this.miniState;
                      }
                    }
                  },
                  [this.__tooltip(h, "labels.expand")]
                ),
                h("q-separator"),
                this.__routes(h),
                h("q-separator"),
                h(
                  "q-tab",
                  {
                    props: {
                      icon: "mdi-logout-variant",
                      label: this.$t("labels.logout")
                    },
                    on: {
                      click: () => {
                        this.logout();
                      }
                    }
                  },
                  [this.__tooltip(h, "labels.logout")]
                )
              ]
            )
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
              countriesList: this.countriesList,
              formatDate: this.dateFormat
            }
          })
        ])
      ])
    ]);
  }
};
</script>

<style lang="stylus" scoped>
.form {
  .q-field {
    margin-bottom: $spaces.md.y;
  }
}

.settings-tabs {
  .q-tabs__content {
    height: 100%;
  }

  .q-tab__label {
    font-weight: 400;
  }
}

.q-drawer--mini {
  .settings-tabs {
    @media screen and (max-width: 767px) {
      .q-tab__label {
        display: none;
      }
    }

    .q-tab .q-badge {
      right: 0;
    }
  }
}

.q-drawer--standard {
  .settings-tabs {
    .q-tab {
      justify-content: flex-start;

      .q-badge {
        right: -20px;
      }
    }
  }
}
</style>