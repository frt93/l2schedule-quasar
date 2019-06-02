<script>
import signup from "component/auth/signup";
export default {
  name: "registrationPage",
  components: {
    signup
  },

  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: "Регистрация"
    };
  },

  render(h) {
    return h("q-page", [h(signup)]);
  }
};
</script>
