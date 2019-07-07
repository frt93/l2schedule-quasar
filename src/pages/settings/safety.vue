<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

import setEmail from "components/ui/settings/safety/setEmail";

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
      confirmEmail: "",
      confirmEmailError: false,
      confirmEmailErrorMessage: "",

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
    async submit() {
      // if (this.canSubmit) {
      //   this.sending = true;
      //   const { user, success, error } = await userAPI.submitSafetySettings(
      //     this.payload
      //   );
      //   this.sending = false;
      //   if (error) {
      //     const { errorType, message } = controllers.handleErrors(error);
      //     this[errorType] = true;
      //     this[`${errorType}Message`] = message;
      //     return;
      //   }
      //   // Устанавливаем новый инстанс пользователя
      //   this.$store.commit("user/setUser", user);
      //   controllers.successNotify(success);
      // }
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

    // __emailInput(h) {
    //   if (!this.userInstance.email) {
    //     return h(
    //       "q-input",
    //       {
    //         attrs: {
    //           autocomplete: false,
    //           value: this.email,
    //           label: this.$t("labels.email"),
    //           hint: this.$t("hints.settings.safety.enterEmail"),
    //           error: this.emailError || !this.email.length,
    //           errorMessage:
    //             this.emailErrorMessage ||
    //             this.$t("hints.settings.safety.enterEmail"),
    //           loading: this.emailLoading
    //         },
    //         on: {
    //           input: value => {
    //             this.email = value;
    //             this.emailLoading = true;
    //           }
    //         }
    //       },
    //       [
    //         h("q-spinner-puff", {
    //           attrs: {
    //             color: this.emailError ? "negative" : "primary"
    //           },
    //           slot: "loading"
    //         })
    //       ]
    //     );
    //   }
    // },

    /**
     * Рендер инпута для ключа подтверждения email адреса
     */
    __emailConfirmInput(h) {
      if (this.userInstance.metadata.emailVerification) {
        // Если у пользователя не подтвержден email адрес
        return h(
          "q-input",
          {
            attrs: {
              autocomplete: false,
              maxlength: 36,
              counter: true,
              value: this.confirmEmail,
              label: this.$t("labels.confirmEmail"),
              error: this.confirmEmailError,
              errorMessage: this.confirmEmailErrorMessage
            },
            on: {
              input: value => {
                this.confirmEmailError = false;
                this.confirmEmailErrorMessage = "";

                this.confirmEmail = value;
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

  render(h) {
    return h("div", { staticClass: "form" }, [
      // this.__emailInput(h),
      // this.__emailConfirmInput(h)
      // this.__submitButton(h)
      h(setEmail, { props: { userInstance: this.userInstance } })
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



