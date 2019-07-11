<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

import addEmail from "components/ui/settings/addEmailInput";
import confirmEmail from "components/ui/settings/confirmEmailInput";
import oauthList from "components/ui/settings/oauthList";

export default {
  name: "safetytSettingsPage",
  meta() {
    return {
      title: this.$t("titles.settings.safety"),
      titleTemplate: title =>
        `${title} - ${this.$t("titles.settings.main")} - L2Schedule`
    };
  },

  props: ["userInstance"],
  data() {
    return {
      oauth: null,
      sending: false
    };
  },

  computed: {
    /**
     * Проверяем отсутствие ошибок и разблокируем кнопку отправки
     */
    canSubmit() {
      return false;
    },

    payload() {
      let payload = { id: this.userInstance.id };
      return payload;
    }
  },

  methods: {
    async submit() {}
  },

  render(h) {
    return h("div", { staticClass: "form column" }, [
      h(addEmail, { props: { user: this.userInstance } }),
      h(confirmEmail, { props: { user: this.userInstance } }),
      h(oauthList, { props: { user: this.userInstance } })
    ]);
  }
};
</script>

<style>
.flags {
  width: 32px;
  height: 32px;
  float: left;
}
</style>



