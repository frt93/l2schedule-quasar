<script>
import auth from "mixin/auth";
import api from "handlers/user/api";
export default {
  name: "confirmPage",
  mixins: [auth],

  methods: {
    async confirmEmail(key) {
      const isUser = this.$store.state.user.instance;
      // Если пользователь авторизован - отправим в запросе его id, чтобы в ответе получить обновленный экземпляр
      // пользовательских данных (при условии, что пользователь подтверждает почтовый адрес от аккаунта, под которым он авторизован)
      const id = isUser ? isUser.id : null;
      // Запускаем переадресацию
      this.$router.replace({ name: "home" });

      const { user, success, error } = await api.confirmEmail(key, id);

      if (error) {
        return this.errorNotify(error);
      }
      if (user) {
        this.$store.commit("user/setUser", user);
      }
      this.successNotify(success);
    }
  },
  beforeMount() {
    const query = this.$route.query;
    if (query.email) {
      this.confirmEmail(query.email);
    }
  },
  meta() {
    return {
      title: this.$t("titles.confirmPage"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  render(h) {
    return h("q-page");
  }
};
</script>
