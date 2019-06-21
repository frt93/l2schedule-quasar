<script>
import signin from "component/auth/signin";
export default {
  name: "loginPage",
  components: {
    signin
  },

  meta() {
    return {
      title: this.$t("titles.authSignin"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  render(h) {
    return h("q-page", [h(signin)]);
  }
};
</script>
