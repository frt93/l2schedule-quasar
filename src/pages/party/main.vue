<script>
import { mapGetters } from "vuex";
import noParty from "components/ui/party/ifNoParty";
export default {
  name: "partyPage",

  meta() {
    return {
      title: this.$t("titles.party.main"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  computed: {
    ...mapGetters({
      user: "user/user"
    })
  },

  render(h) {
    return h("q-page", { staticClass: "flex flex-center" }, [
      h(noParty, { props: { user: this.user } })
    ]);
  }
};
</script>
