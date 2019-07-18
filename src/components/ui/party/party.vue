<script>
export default {
  name: "partyComponent",
  props: ["party"],
  render(h) {
    // return h("div", [
    //   h("div", { staticClass: "party-aside-left" }, [
    //     h("div", { staticClass: "party-header column flex-center" }, [
    //       h("q-avatar", { attrs: { size: "100px" } }, [
    //         h("img", {
    //           attrs: { src: "https://cdn.quasar.dev/img/avatar.png" }
    //         })
    //       ]),
    //       h("div", { staticClass: "text-h6" }, this.party.name),
    //       h("div", this.party.leader.username)
    //     ])
    //   ])
    // ]);

    return h("div", { staticClass: "absolute-full" }, [
      h("q-card", { staticClass: "left-side row" }, [
        h("img", {
          attrs: { src: "https://cdn.quasar.dev/img/parallax2.jpg" }
        }),
        h("q-list", [
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
                  "q-badge",
                  { attrs: { floating: true, color: "transparent" } },
                  [
                    h("q-icon", {
                      attrs: {
                        name: "mdi-crown",
                        color: "orange-6"
                      }
                    })
                  ]
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
          ])
        ])
      ])
    ]);
  }
};
</script>

<style lang="stylus" scoped>
.left-side {
  width: 100%;
  max-width: 250px;
}
</style>