

<script>
import mainheader from "components/ui/header/main";
import { mapState, mapGetters } from "vuex";
export default {
  name: "settingsLayout",
  components: { mainheader },

  data() {
    return {};
  },

  computed: {
    ...mapState({
      user: state => state.user.instance,
      lang: state => state.user.language,
      timezoneList: state => state.user.timezoneList,
      countriesList: state => state.user.countriesList
    }),

    ...mapGetters({
      timezone: "user/timezone"
    })
  },

  render(h) {
    return h("q-layout", { props: { view: "lHh lpR fFf" } }, [
      h(mainheader),
      h("q-page-container", [
        h("q-page", [
          h(
            "div",
            {
              staticClass: "float-left window-height q-mr-xl",
              style: {
                "max-width": "30vw"
              }
            },
            [
              h(
                "q-list",
                {
                  props: {
                    bordered: true,
                    separator: true
                  }
                },
                [
                  h(
                    "q-item",
                    {
                      props: {
                        to: { name: "settings/account" },
                        replace: true,
                        "v-ripple": true
                      }
                    },
                    [
                      h("q-item-section", [
                        h("q-item-label"),
                        this.$t("tabs.settings.account")
                      ])
                    ]
                  ),
                  h(
                    "q-item",
                    {
                      props: {
                        to: { name: "settings/password" },
                        replace: true,
                        "v-ripple": true
                      }
                    },
                    [
                      h("q-item-section", [
                        h("q-item-label"),
                        this.$t("tabs.settings.password")
                      ])
                    ]
                  ),
                  h(
                    "q-item",
                    {
                      props: {
                        to: { name: "settings/safety" },
                        replace: true,
                        "v-ripple": true
                      }
                    },
                    [
                      h("q-item-section", [
                        h("q-item-label"),
                        this.$t("tabs.settings.safety")
                      ])
                    ]
                  )
                ]
              )
            ]
          ),
          h("router-view", {
            attrs: {
              userInstance: this.user,
              lang: this.lang,
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

<style lang="stylus">
.form .q-field {
  margin-bottom: $spaces.md.y;
}
</style>