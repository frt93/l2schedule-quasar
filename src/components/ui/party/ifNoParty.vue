<script>
import create from "components/ui/party/createDialog";
export default {
  name: "noPartyComponent",
  beforeMount() {
    if (!this.user.id) {
      this.$router.replace({ name: "parties" });
    }
  },
  props: ["user"],
  methods: {
    create() {
      this.$q
        .dialog({
          component: create,
          root: this.$root
        })
        .onOk(payload => {
          groupAPI.create(payload);
        });
    }
  },
  render(h) {
    if (typeof this.user === "object" && !this.user.metadata.group) {
      return h("div", { staticClass: "column" }, [
        h(
          "div",
          { staticClass: "row justify-center" },
          this.$t("party.noParty.1")
        ),
        h("div", { staticClass: " justify-center" }, [
          h(
            "span",
            {
              staticClass: "dashed cursor-pointer",
              on: {
                click: () => {
                  this.create();
                }
              }
            },
            this.$t("party.noParty.2")
          ),
          h("span", {}, [`  ${this.$t("or")} `]),
          h(
            "span",
            {
              staticClass: "dashed cursor-pointer",
              on: {
                click: () => {
                  this.$router.push({ name: "parties" });
                }
              }
            },
            this.$t("party.noParty.3")
          )
        ])
      ]);
    }
  }
};
</script>
