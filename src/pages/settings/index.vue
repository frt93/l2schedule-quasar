<script>
import settings from "component/ui/settings/index";
export default {
  name: "settingsMainPage",
  components: { settings },
  meta() {
    return {
      title: "Настройки",
      titleTemplate: title => `${title} - L2Schedule`
    };
  },
  render(h) {
    return h("q-page", [h(settings)]);
  }
};
</script>