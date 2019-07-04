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

  methods: {
    text() {
      if (this.$store.state.user.instance != null) {
        return this.$store.state.user.instance.username;
      } else {
        return "guest";
      }
    }
  },

  render(h) {
    return h("q-page", { staticClass: "flex" }, this.text());
  }
};
</script>
