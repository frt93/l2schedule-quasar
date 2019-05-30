<script>
import signin from "component/auth/signin";
export default {
  name: "loginPage",
  components: {
    signin
  },

  render(h) {
    return h("q-page", [h(signin)]);
  }
};
</script>
