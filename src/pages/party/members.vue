<script>
export default {
  name: "partyMembers",
  meta() {
    return {
      title: this.$t("titles.party.members"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },
  render(h) {
    return h("div", "Party members");
  }
};
</script>
