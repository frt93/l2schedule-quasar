<script>
import signin from "component/auth/signin";
export default {
  name: "loginPage",
  components: {
    signin
  },

  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: "Авторизация"
    };
  },

  render(h) {
    return h("q-page", [h(signin)]);
  }
};
</script>
