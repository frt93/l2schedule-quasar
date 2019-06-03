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
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: "РБшки"
    };
  },

  render(h) {
    return h("q-page", [h(rbList)]);
  }
};
</script>
