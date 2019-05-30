<script>
import repair from "component/auth/repair";
export default {
  name: "repairPasswordPage",
  components: { repair },

  render(h) {
    return h("q-page", [h(repair)]);
  }
};
</script>
