<script>
import mainheader from "components/ui/header/main";
export default {
  name: "mainLayout",
  components: { mainheader },
  data() {
    return {};
  },

  render(h) {
    return h("q-layout", { props: { view: "lHh lpR fFf" } }, [
      h(mainheader),
      h("q-page-container", [h("router-view")])
    ]);
  }
};
</script>