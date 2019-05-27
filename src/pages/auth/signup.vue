<script>
import signup from "component/auth/signup";
export default {
  name: "registerPage",
  components: {
    signup
  },

  render(h) {
    return h("q-page", [h(signup)]);
  }
};
</script>
