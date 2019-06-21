<script>
import auth from "mixin/auth";
import api from "handlers/user/api";
export default {
  name: "accountSettingsPage",
  mixins: [auth],
  props: ["userInstance"],

  data() {
    return {
      emailConfirmKey: ""
    };
  },

  computed: {
    /**
     * Проверяем отсутствие ошибок и разблокируем кнопку отправки
     */
    canSubmit() {
      return this.emailConfirmKey.length == 36 ? true : false;
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        this.loading.submit = true;

        const { user, success, error } = await api.confirmEmail(
          this.emailConfirmKey,
          this.userInstance.id
        );
        this.loading.submit = false;

        if (error) {
          return this.handleErrors(error);
        }

        if (user) {
          this.$store.commit("user/setUser", user);
        }
        this.emailConfirmKey = "";
        this.successNotify(success);
      }
    },

    /**
     * Открываем диалог для подтверждения повторной отправки ключа подтверждения email адреса
     */
    resendKey() {
      this.$q
        .dialog({
          title: this.$t("labels.confirm"),
          message: `${this.$t("labels.resendConfirmKey")} ${
            this.userInstance.email
          }`,
          cancel: true,
          persistent: true
        })
        .onOk(async () => {
          const { success, error } = await api.resendEmailConfirmationKey(
            this.userInstance.id
          );
          if (error) {
            return this.handleErrors(error);
          }
          this.successNotify(success);
        });
    },

    /**
     * Рендер инпута для ключа подтверждения email адреса
     */
    __emailConfirmInput(h) {
      if (this.userInstance.metadata.emailVerification !== undefined) {
        // Если у пользователя не подтвержден email адрес
        return h(
          "q-input",
          {
            attrs: {
              autocomplete: false,
              maxlength: 36,
              counter: true,
              value: this.emailConfirmKey,
              label: this.$t("labels.confirmKey"),
              error: this.usernameError,
              errorMessage: this.usernameErrorMessage,
              loading: this.loading.username
            },
            on: {
              input: value => {
                this.emailConfirmKey = value;
              }
            }
          },
          [
            h("div", { staticClass: "multiline-hint", slot: "hint" }, [
              this.__emailConfirmHint(h)
            ]),
            h("q-spinner-puff", {
              attrs: {
                color: this.usernameError ? "negative" : "primary"
              },
              slot: "loading"
            })
          ]
        );
      }
    },

    /**
     * Рендер подсказки для инпута ключа подтверждения email адреса
     */
    __emailConfirmHint(h) {
      return [
        h("span", this.$t("hints.settings.safety.email1")),
        h(
          "span",
          {
            staticClass: "cursor-pointer dashed",
            on: {
              click: () => {
                this.resendKey();
              }
            }
          },
          this.$t("hints.settings.safety.email2")
        ),
        h("span", this.$t("hints.settings.safety.email3")),
        h(
          "span",
          {
            staticClass: "cursor-pointer dashed",
            on: {
              click: () => {
                this.$router.push({ name: "settings/account" });
              }
            }
          },
          this.$t("hints.settings.safety.email4")
        ),
        h("span", this.$t("hints.settings.safety.email5"))
      ];
    },

    /**
     * Рендер кнопки отправки формы по условию
     */
    __submitButton(h) {
      return h(
        "q-btn",
        {
          staticClass: "float-right q-my-lg",
          class: {
            loading: this.loading.submit
          },
          attrs: {
            label: this.$t("labels.save"),
            loading: this.loading.submit,
            color: this.canSubmit ? "green-6" : "red-6",
            disable: !this.canSubmit
          },
          on: {
            click: () => {
              this.submit();
            }
          }
        },
        [
          h(
            "div",
            {
              slot: "loading"
            },
            [this._v(this.$t("labels.sending")), h("q-spinner-dots")]
          )
        ]
      );
    }
  },

  meta() {
    return {
      title: this.$t("titles.settings.safety"),
      titleTemplate: title =>
        `${title} - ${this.$t("titles.settings.main")} - L2Schedule`
    };
  },

  render(h) {
    return h("div", { staticClass: "form" }, [
      this.__emailConfirmInput(h),
      this.__submitButton(h)
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



