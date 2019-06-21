<script>
export default {
  name: "PageIndex",
  data() {
    return {};
  },

  meta() {
    return {
      title: this.$t("titles.mainPage"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  render(h) {
    return h("q-page", { staticClass: "flex" });
  }
};
</script>
