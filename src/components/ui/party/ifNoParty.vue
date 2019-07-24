<script>
export default {
  name: "noPartyComponent",

  props: ["user"],
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
