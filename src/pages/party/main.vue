<script>
// import party from "components/ui/party/party";
import noParty from "components/ui/party/ifNoParty";
export default {
  name: "partyPage",
  props: ["user", "party"],
  meta() {
    return {
      title: this.$t("titles.party.main"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  methods: {
    __view(h) {
      if (this.party) {
        return h("div", "Стена пати");
      } else if (this.user.id && !this.party) {
        return h(noParty, { props: { user: this.user } });
      }
    }
  },

  render(h) {
    return h("div", [this.__view(h)]);
  }
};
</script>
