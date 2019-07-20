<script>
import dateAPI from "handlers/date";
export default {
  name: "asideColumn",
  props: ["user", "party"],
  methods: {
    __tooltip(h, message) {
      return h("q-no-ssr", [
        h(
          "q-tooltip",
          {
            props: {
              transitionShow: "scale",
              transitionHide: "scale"
            }
          },
          this.$t(message)
        )
      ]);
    }
  },
  render(h) {
    return h("q-card", { staticClass: "absolute-full left-side row" }, [
      h("img", {
        attrs: { src: "https://cdn.quasar.dev/img/parallax2.jpg" }
      }),
      h("q-list", { attrs: { style: "width:100%" } }, [
        h(
          "q-item",
          {
            staticClass: "text-h5 row justify-center"
          },
          [
            h(
              "q-item-label",
              {
                staticClass: " cursor-pointer",
                on: {
                  click: () => {
                    this.$router.push({
                      name: "party",
                      params: { name: this.party.name }
                    });
                  }
                }
              },
              this.party.name
            )
          ]
        ),
        h("q-item", [
          h("q-item-section", { attrs: { avatar: true } }, [
            h("q-icon", {
              attrs: { name: "mdi-comment-text-outline" }
            })
          ]),
          h("q-item-section", [h("q-item-label", this.party.about)])
        ]),
        h("q-item", [
          h("q-item-section", { attrs: { avatar: true } }, [
            h("q-icon", {
              attrs: { name: "mdi-calendar-multiselect" }
            })
          ]),
          h("q-item-section", [
            h(
              "q-item-label",
              { staticClass: "text-capitalize" },
              dateAPI.calendarDate(this.party.createdAt)
            )
          ])
        ]),
        h("q-separator"),
        h("q-item", [
          h("q-item-section", { attrs: { avatar: true } }, [
            h("q-avatar", [
              h("img", {
                attrs: {
                  src: this.party.leader.avatar
                    ? this.party.leader.avatar
                    : "statics/avatar.png"
                }
              }),
              h(
                "q-icon",
                {
                  staticClass: "pl absolute",
                  attrs: {
                    name: "mdi-crown",
                    color: "orange-6"
                  }
                },
                [this.__tooltip(h, "pl")]
              )
            ])
          ]),
          h(
            "q-item-section",
            {
              staticClass: "cursor-pointer",
              on: {
                click: () => {
                  this.$router.push({
                    name: "user",
                    params: { username: this.party.leader.username }
                  });
                }
              }
            },
            [
              h("q-item-label", this.party.leader.name),
              h(
                "q-item-label",
                { attrs: { caption: true } },
                `@${this.party.leader.username}`
              )
            ]
          )
        ]),
        h("q-separator"),
        h("q-item", { staticClass: "cursor-pointer" }, [
          h("q-item-section", { attrs: { avatar: true } }, [
            h("q-icon", {
              attrs: { name: "mdi-account-group-outline" }
            })
          ]),
          h(
            "q-item-section",
            {
              on: {
                click: () => {
                  this.$router.push({
                    name: "party/members",
                    params: { name: this.party.name }
                  });
                }
              }
            },
            [h("q-item-label", { staticClass: "text-capitalize" }, "Members")]
          )
        ]),
        h("q-item", { staticClass: "cursor-pointer" }, [
          h("q-item-section", { attrs: { avatar: true } }, [
            h("q-icon", {
              attrs: { name: "mdi-account-plus-outline" }
            })
          ]),
          h("q-item-section", [
            h("q-item-label", { staticClass: "text-capitalize" }, "Invite user")
          ])
        ]),
        h("q-item", { staticClass: "cursor-pointer" }, [
          h("q-item-section", { attrs: { avatar: true } }, [
            h("q-icon", {
              attrs: { name: "mdi-account-minus-outline" }
            })
          ]),
          h("q-item-section", [
            h("q-item-label", { staticClass: "text-capitalize" }, "Leave party")
          ])
        ])
      ])
    ]);
  }
};
</script>
<style lang="stylus" scoped>
.q-card {
  box-shadow: none;
  background: none;
  border-radius: 0;
}

.left-side {
  width: 100%;
  max-width: 250px;

  .q-item {
    padding-left: 0;
  }

  .q-item__section--avatar {
    min-width: 0;
    color: rgba(0, 0, 0, 0.7);
  }
}

.pl {
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: #fff;
}
</style>