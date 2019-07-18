<script>
import { mapState, mapGetters } from "vuex";
import noParty from "components/ui/party/ifNoParty";
import party from "components/ui/party/party";

export default {
  name: "partyPage",
  async preFetch({ store }) {
    const partyID = store.state.user.instance.party.id;
    await store.dispatch("party/prefetch", partyID);
  },
  meta() {
    return {
      title: this.$t("titles.party.main"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  computed: {
    ...mapState({
      party: state => state.party.current
    }),

    ...mapGetters({
      user: "user/user"
    })
  },

  render(h) {
    return h("q-page", { staticClass: "flex flex-center" }, [
      h(noParty, { props: { user: this.user } }),
      h(party, { props: { user: this.user, party: this.party } })
    ]);
  }
};
</script>
