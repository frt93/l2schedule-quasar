<script>
import repair from "component/auth/repair";
export default {
  name: "repairPasswordPage",
  components: { repair },

  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: "Восстановить пароль"
    };
  },

  render(h) {
    return h("q-page", [h(repair)]);
  }
};
</script>
