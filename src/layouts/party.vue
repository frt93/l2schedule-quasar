<script>
import { mapState, mapGetters } from "vuex";

import mainheader from "./header/main";
import aside from "components/ui/party/aside";
export default {
  name: "partyLayout",

  async preFetch({ store, currentRoute, redirect }) {
    let query;

    if (currentRoute.params.name) {
      query = { key: "name", value: currentRoute.params.name };
    } else {
      const user = store.state.user.instance;
      if (user !== null && user.party) {
        redirect(`/party/${user.party.name}`);
      } else {
        redirect("/parties");
      }
    }

    if (query) {
      await store.dispatch("party/prefetch", query);
    }
  },

  async beforeRouteUpdate(to, from, next) {
    const query = { key: "name", value: to.params.name };
    await this.$store.dispatch("party/prefetch", query);
    next();
  },

  computed: {
    ...mapState({
      party: state => state.party.current
    }),

    ...mapGetters({
      user: "user/user"
    })
  },

  methods: {
    __renderAside(h) {
      if (this.party !== null) {
        return h(aside, { props: { user: this.user, party: this.party } });
      }
    }
  },

  render(h) {
    return h("q-layout", { attrs: { view: "hHh Lpr lff" } }, [
      h(mainheader),
      h("q-page-container", [
        h("q-page", { staticClass: "flex flex-center" }, [
          this.__renderAside(h),
          h("router-view", { attrs: { user: this.user, party: this.party } })
        ])
      ])
    ]);
  }
};
</script>