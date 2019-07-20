
<script>
export default {
  name: "partiesList",
  data() {
    return {};
  },

  meta() {
    return {
      title: this.$t("titles.party.all"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  methods: {
    noParty(h) {
      return [h("div", { staticClass: "column" }, "All parties")];
    }
  },

  render(h) {
    return h("q-page", { staticClass: "flex flex-center" }, [this.noParty(h)]);
  }
};
</script>
