<script>
import dateAPI from "handlers/date";

import inviteDialog from "components/ui/party/inviteDialog";
import invitesList from "components/ui/party/invitesList";
export default {
  name: "asideColumn",
  props: ["user", "party", "userParty"],
  computed: {
    isPL() {
      if (this.user.id == this.party.leader.id) {
        return true;
      }

      return false;
    },
    isMember() {
      if (this.userParty && this.userParty.id == this.party.id) {
        return true;
      }
      return false;
    }
  },
  methods: {
    invite() {
      this.$q.dialog({
        component: inviteDialog,
        user: this.user,
        root: this.$root
      });
    },

    invitesDialog() {
      this.$q.dialog({
        component: invitesList,
        party: this.userParty,
        root: this.$root
      });
    },

    __invites(h) {
      if (this.party.membersInvitations) {
        return h(
          "q-item",
          {
            attrs: { clickable: true },
            on: {
              click: () => {
                this.invitesDialog();
              }
            }
          },
          [
            h("q-item-section", { attrs: { avatar: true } }, [
              h("q-icon", {
                attrs: { name: "mdi-account-multiple-plus-outline" }
              })
            ]),
            h("q-item-section", [h("q-item-label", this.$t("party.invites"))])
          ]
        );
      }
    },

    __inviteButton(h) {
      if (this.isMember) {
        return h(
          "q-item",
          {
            attrs: { clickable: true },
            on: {
              click: () => {
                this.invite();
              }
            }
          },
          [
            h("q-item-section", { attrs: { avatar: true } }, [
              h("q-icon", {
                attrs: { name: "mdi-account-plus-outline" }
              })
            ]),
            h("q-item-section", [h("q-item-label", this.$t("party.invite"))])
          ]
        );
      }
    },

    __leaveButton(h) {
      if (this.isMember) {
        const caption = () => {
          if (this.isPL) {
            return h(
              "q-item-label",
              { attrs: { caption: true } },
              this.$t("party.PLleave")
            );
          }
        };

        return h(
          "q-item",
          {
            staticClass: "text-red",
            attrs: {
              disable: this.isPL ? true : false,
              clickable: true
            }
          },
          [
            h("q-item-section", { attrs: { avatar: true } }, [
              h("q-icon", {
                attrs: { name: "mdi-account-minus-outline", color: "red-6" }
              })
            ]),
            h("q-item-section", [
              h("q-item-label", this.$t("party.leave")),
              caption()
            ])
          ]
        );
      }
    },

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
                      params: { name: this.party.slug }
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
        h(
          "q-item",
          {
            props: {
              clickable: true,
              to: {
                name: "user",
                params: { username: this.party.leader.username }
              }
            }
          },
          [
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
            h("q-item-section", [
              h("q-item-label", this.party.leader.name),
              h(
                "q-item-label",
                { attrs: { caption: true } },
                `@${this.party.leader.username}`
              )
            ])
          ]
        ),
        h("q-separator"),
        h(
          "q-item",
          {
            props: {
              clickable: true,
              to: {
                name: "party/members",
                params: { name: this.party.slug }
              }
            }
          },
          [
            h("q-item-section", { attrs: { avatar: true } }, [
              h("q-icon", {
                attrs: { name: "mdi-account-group-outline" }
              })
            ]),
            h("q-item-section", [h("q-item-label", this.$t("party.members"))])
          ]
        ),
        this.__invites(h),
        this.__inviteButton(h),
        this.__leaveButton(h)
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