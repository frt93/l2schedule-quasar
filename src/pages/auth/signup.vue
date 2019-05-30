<script>
import signup from "component/auth/signup";
export default {
  name: "registrationPage",
  components: {
    signup
  },

  render(h) {
    return h("q-page", [h(signup)]);
  }
};
</script>
