<script>
import { mapState, mapGetters } from "vuex";
export default {
  name: "userPage",
  async preFetch({ store, currentRoute }) {
    const username = currentRoute.params.username;
    await store.dispatch("user/getUser", username);
  },

  computed: {
    ...mapState({
      viewedUser: state => state.user.viewedUser
    }),

    ...mapGetters({
      user: "user/user"
    })
  },

  render(h) {
    return h("div", this.viewedUser.username);
  }
};
</script>
