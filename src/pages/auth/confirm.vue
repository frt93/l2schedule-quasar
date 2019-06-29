<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
export default {
  name: "confirmPage",
  meta() {
    return {
      title: this.$t("titles.confirmPage"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },
  beforeMount() {
    const query = this.$route.query;
    if (query.email) {
      this.confirmEmail(query.email);
    }
  },

  methods: {
    async confirmEmail(key) {
      const isUser = this.$store.state.user.instance;
      // Если пользователь авторизован - отправим в запросе его id, чтобы в ответе получить обновленный экземпляр
      // пользовательских данных (при условии, что пользователь подтверждает почтовый адрес от аккаунта, под которым он авторизован)
      const id = isUser ? isUser.id : null;
      // Запускаем переадресацию
      this.$router.replace({ name: "home" });

      const { user, success, error } = await userAPI.confirmEmail(key, id);

      if (error) {
        return controllers.errorNotify(error);
      }
      if (user) {
        this.$store.commit("user/setUser", user);
      }
      controllers.successNotify(success);
    }
  },

  render(h) {
    return h("q-page");
  }
};
</script>
