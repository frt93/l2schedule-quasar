<script>
import repair from "component/auth/repair";
export default {
  name: "repairPasswordPage",
  components: { repair },

  meta() {
    return {
      title: this.$t("titles.authRepair"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  render(h) {
    return h("q-page", [h(repair)]);
  }
};
</script>
