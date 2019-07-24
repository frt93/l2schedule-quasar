
<script>
import create from "components/ui/party/createDialog";

export default {
  name: "partiesList",
  data() {
    return {};
  },

  meta() {
    return {
      title: this.$t("titles.party.all"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  methods: {
    noParty(h) {
      return [h("div", { staticClass: "column" }, "All parties")];
    },

    create() {
      this.$q.dialog({
        component: create,
        user: this.user,
        root: this.$root
      });
    }
  },

  render(h) {
    return h("q-page", { staticClass: "flex flex-center" }, [
      this.noParty(h),
      h(
        "q-btn",
        {
          on: {
            click: () => {
              this.create();
            }
          }
        },
        "Create party"
      )
    ]);
  }
};
</script>
