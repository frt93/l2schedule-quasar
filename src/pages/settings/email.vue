<script>
import email from "component/ui/settings/email";
export default {
  name: "settingsPage",
  components: { email },

  render(h) {
    return h("q-page", [h(email)]);
  }
};
</script>