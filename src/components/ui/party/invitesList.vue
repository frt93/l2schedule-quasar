<script>
import { debounce } from "quasar";
import { mapState } from "vuex";
import partyAPI from "handlers/party/api";
import dateAPI from "handlers/date";
export default {
  name: "invitesListDialog",

  computed: {
    ...mapState({
      party: state => state.party.userParty
    })
  },

  methods: {
    show() {
      this.$refs.dialog.show();
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      this.$emit("hide");
    },

    async cancelInvite(invite) {
      const party = await partyAPI.cancelInvite(invite.id);

      if (party) {
        this.$store.commit("party/SetUserParty");
      }
    },

    __list(h) {
      let nodes = [];

      this.party.membersInvitations.forEach(invite => {
        nodes.push(
          h(
            "q-item",
            {
              attrs: {
                clickable: true
              }
            },
            [
              h("q-item-section", { attrs: { avatar: true } }, [
                h("q-avatar", [
                  h("img", {
                    attrs: {
                      src: invite.invitee.metadata.avatar
                        ? invite.invitee.metadata.avatar
                        : "statics/avatar.png"
                    }
                  })
                ])
              ]),
              h("q-item-section", [
                h("q-item-label", [
                  invite.invitee.metadata.name || invite.invitee.username,
                  h("q-badge", {
                    attrs: {
                      align: "top",
                      color: "transparent",
                      textColor: "grey",
                      label: `@${invite.invitee.username}`
                    }
                  })
                ]),
                h(
                  "q-item-label",
                  { attrs: { caption: true } },
                  `invited ${dateAPI.dateFromIso(invite.date)} by @${
                    invite.inviter.username
                  }`
                )
              ]),
              h("q-item-section", { attrs: { side: true } }, [
                h(
                  "q-btn",
                  {
                    attrs: {
                      round: true,
                      flat: true,
                      icon: "mdi-close-box",
                      color: "red-6"
                    },
                    on: {
                      click: () => {
                        this.cancelInvite(invite);
                      }
                    }
                  },
                  [
                    this.__tooltip(
                      h,
                      "party.cancelInvite",
                      invite.invitee.username
                    )
                  ]
                )
              ])
            ]
          )
        );
      });

      return h("q-list", nodes);
    },

    __tooltip(h, message, name) {
      return h("q-no-ssr", [
        h(
          "q-tooltip",
          {
            props: {
              transitionShow: "scale",
              transitionHide: "scale"
            }
          },
          this.$t(message, { name })
        )
      ]);
    }
  },

  render(h) {
    return h(
      "q-dialog",
      {
        ref: "dialog",
        props: { persistent: true },
        on: {
          hide: () => {
            this.onDialogHide();
          }
        }
      },
      [
        h(
          "q-card",
          {
            staticClass: "q-dialog-plugin",
            style: "width: 700px; max-width: 80vw"
          },
          [
            h("q-toolbar", [
              h("q-toolbar-title", this.$t("party.invites")),
              h("q-btn", {
                props: {
                  flat: true,
                  round: true,
                  ripple: false,
                  icon: "mdi-close"
                },
                on: {
                  click: () => {
                    this.hide();
                  }
                }
              })
            ]),
            h("q-card-section", [this.__list(h)])
          ]
        )
      ]
    );
  }
};
</script>
 
 <style lang="stylus" scoped>
 .q-badge {
   margin-left: 0;
 }

 .q-item {
   @media screen and (max-width: 600px) {
     padding: 8px 0;
   }
 }
</style>
 