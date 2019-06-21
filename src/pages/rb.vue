<script>
import rbList from "../components/rbList";
export default {
  name: "rbPage",
  components: {
    rbList
  },
  preFetch({ store }) {
    // return store.dispatch("fetch");
  },
  meta() {
    return {
      title: this.$t("titles.rbPage")
    };
  },

  render(h) {
    return h("q-page", [h(rbList)]);
  }
};
</script>
