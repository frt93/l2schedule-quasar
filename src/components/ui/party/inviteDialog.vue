<script>
import { debounce } from "quasar";
import { mapState } from "vuex";
import partyAPI from "handlers/party/api";
export default {
  name: "inviteToPartyDialog",
  props: ["user"],
  data() {
    return {
      name: "",
      loading: false,
      users: [],
      noResults: false
    };
  },

  computed: {
    ...mapState({
      party: state => state.party.userParty
    })
  },

  methods: {
    async sendInvite(user) {
      const payload = {
        invitee: { id: user.id, username: user.username },
        inviterID: this.user.id,
        partyID: this.party.id
      };

      const party = await partyAPI.sendInvite(payload);
      if (party) {
        // Инвайт отправлен и информация об этом сохранена в экземпляре данных пати. В результате запроса мы получаем этот экземпляр и обновляем его в store
        this.$store.commit("party/setUserParty", party);
      }
    },

    show() {
      this.$refs.dialog.show();
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      this.$emit("hide");
    },

    __usersList(h) {
      let nodes = [];

      this.users.forEach(user => {
        nodes.push(
          h(
            "q-item",
            {
              attrs: {
                clickable: true,
                disable: this.isUserInvited(user) ? true : false
              }
            },
            [
              h("q-item-section", { attrs: { avatar: true } }, [
                h("q-avatar", [
                  h("img", {
                    attrs: {
                      src: user.metadata.avatar
                        ? user.metadata.avatar
                        : "statics/avatar.png"
                    }
                  })
                ])
              ]),
              h("q-item-section", [
                h("q-item-label", user.metadata.name || user.username),
                h(
                  "q-item-label",
                  { attrs: { caption: true } },
                  `@${user.username}`
                )
              ]),
              h("q-item-section", { attrs: { side: true } }, [
                this.__itemSide(h, user)
              ])
            ]
          )
        );
      });

      if (this.noResults) {
        nodes.push(
          h(
            "q-item",
            { staticClass: "justify-center text-grey" },
            this.$t("noResults")
          )
        );
      }

      return h("q-list", { attrs: { padding: true } }, nodes);
    },

    __itemSide(h, user) {
      if (this.isUserInvited(user)) {
        return h("q-chip", {
          attrs: {
            label: this.$t("party.invited"),
            color: "transparent",
            textColor: "orange-14",
            iconRight: "mdi-check-all"
          }
        });
      } else {
        return h(
          "q-btn",
          {
            attrs: {
              round: true,
              flat: true,
              icon: "mdi-account-arrow-right-outline",
              color: "green-6"
            },
            on: {
              click: () => {
                this.sendInvite(user);
              }
            }
          },
          [this.__tooltip(h, "party.sendInvite", user.username)]
        );
      }
    },

    isUserInvited(user) {
      return this.party.membersInvitations.find(invite => {
        return invite.invitee.id == user.id;
      });
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

  watch: {
    name: debounce(async function(name) {
      if (name.replace(/\s+/g, "").length) {
        const { users } = await partyAPI.usersToInvite(name, this.party.id);

        if (!users.length) {
          this.noResults = true;
        }

        this.users = users;
      } else {
        this.users = [];
      }

      this.loading = false;
    }, 1500)
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
              h("q-toolbar-title", this.$t("party.invite")),
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
            h("q-card-section", [
              h(
                "q-input",
                {
                  style: "padding-bottom:1rem",
                  attrs: {
                    autocomplete: false,
                    value: this.name,
                    label: this.$t("party.labels.filterUsers"),
                    loading: this.loading
                  },
                  on: {
                    input: value => {
                      this.name = value;
                      this.users = [];
                      this.noResults = false;
                      this.loading = true;
                    }
                  }
                },
                [
                  h("q-spinner-puff", {
                    props: {
                      color: "primary"
                    },
                    slot: "loading"
                  })
                ]
              ),
              this.__usersList(h)
            ])
          ]
        )
      ]
    );
  }
};
</script>
 