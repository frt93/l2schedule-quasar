<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
export default {
  name: "accountSettingsPage",
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
      email: "",
      emailError: false,
      emailErrorMessage: "",

      confirmKey: "",
      confirmKeyError: false,
      confirmKeyErrorMessage: "",

      emailLoading: false,
      sending: false
    };
  },

  computed: {
    /**
     * Проверяем отсутствие ошибок и разблокируем кнопку отправки
     */
    canSubmit() {
      return this.confirmKey.length == 36 && !this.confirmKeyError
        ? true
        : false;
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        this.sending = true;

        const { user, success, error } = await userAPI.confirmEmail(
          this.confirmKey,
          this.userInstance.id
        );
        this.sending = false;

        if (error) {
          const { message } = controllers.handleErrors(error);
          this.confirmKeyError = true;
          this.confirmKeyErrorMessage = message;

          return;
        }

        if (user) {
          this.$store.commit("user/setUser", user);
        }

        this.confirmKey = "";
        controllers.successNotify(success);
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
          const { success, error } = await userAPI.resendEmailConfirmationKey(
            this.userInstance.id
          );

          if (error) {
            return controllers.handleErrors(error);
          }

          controllers.successNotify(success);
        });
    },

    __emailInput(h) {
      if (!this.userInstance.email) {
        return h(
          "q-input",
          {
            attrs: {
              autocomplete: false,
              value: this.email,
              label: this.$t("labels.email"),
              hint: this.$t("hints.settings.email"),
              error: this.emailError,
              errorMessage: this.emailErrorMessage,
              loading: this.emailLoading
            },
            on: {
              input: value => {
                this.email = value;
                this.emailLoading = true;
              }
            }
          },
          [
            h("q-spinner-puff", {
              attrs: {
                color: this.emailError ? "negative" : "primary"
              },
              slot: "loading"
            })
          ]
        );
      }
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
              value: this.confirmKey,
              label: this.$t("labels.confirmKey"),
              error: this.confirmKeyError,
              errorMessage: this.confirmKeyErrorMessage
            },
            on: {
              input: value => {
                this.confirmKeyError = false;
                this.confirmKeyErrorMessage = "";

                this.confirmKey = value;
              }
            }
          },
          [
            h("div", { staticClass: "multiline-hint", slot: "hint" }, [
              this.__emailConfirmHint(h)
            ])
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
            loading: this.sending
          },
          attrs: {
            label: this.$t("labels.save"),
            loading: this.sending,
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

  watch: {
    email: debounce(async function(email) {
      this.emailError = false;
      this.emailErrorMessage = "";

      if (email !== this.userInstance.email) {
        this.emailErrorMessage = controllers.validateEmail(email);

        if (this.emailErrorMessage) {
          this.emailError = true;
        } else {
          const { message } = await controllers.checkEmail(email);
          if (message) {
            this.emailError = true;
            this.emailErrorMessage = message;
          }
        }
      }

      this.loading.email = false;
    }, 1500)
  },

  render(h) {
    return h("div", { staticClass: "form" }, [
      this.__emailInput(h),
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



