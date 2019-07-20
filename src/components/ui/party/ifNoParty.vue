<script>
import create from "components/ui/party/createDialog";
export default {
  name: "noPartyComponent",

  props: ["user"],
  methods: {
    create() {
      this.$q.dialog({
        component: create,
        user: this.user,
        root: this.$root
      });
    }
  },
  render(h) {
    return h("div", { staticClass: "column items-center" }, [
      h("div", { staticClass: "row" }, [
        h("q-icon", {
          attrs: { name: "mdi-alert-circle-outline", size: "150px" }
        })
      ]),

      h("div", { staticClass: "row" }, [
        h("p", this.$t("party.notFound", { name: this.$route.params.name }))
      ])
    ]);
  }
};
</script>
