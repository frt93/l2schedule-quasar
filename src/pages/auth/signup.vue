<script>
import signup from "component/auth/signup";
export default {
  name: "registrationPage",
  components: {
    signup
  },

  data() {
    return {
      previous: ""
    };
  },

  meta() {
    return {
      title: "Регистрация",
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  render(h) {
    return h("q-page", [h(signup)]);
  }
};
</script>
