<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

export default {
  name: "confrimEmailInput",
  props: ["userInstance"],

  data() {
    return {
      confirmKey: "",
      error: false,
      errorMessage: "",

      loading: false,
      sending: false
    };
  },

  computed: {
    canSubmit() {
      return this.error || this.loading || this.confirmKey.length < 36
        ? false
        : true;
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        const id = this.userInstance.id;

        this.sending = true;
        const { user, success, error } = await userAPI.confirmEmail(
          this.confirmKey,
          id
        );
        this.sending = false;

        if (error) {
          const { errorType, message } = controllers.handleErrors(error);
          this.error = true;
          this.errorMessage = message;
          return;
        }
        // Устанавливаем новый инстанс пользователя
        this.$store.commit("user/setUser", user);
        controllers.successNotify(success);
      }
    },

    /**
     * Рендер инпута для ключа подтверждения email адреса
     */
    __input(h) {
      return h(
        "q-input",
        {
          attrs: {
            autocomplete: false,
            maxlength: 36,
            counter: true,
            value: this.confirmKey,
            label: this.$t("labels.confirmEmail"),
            "bottom-slots": true,
            error: this.error || this.confirmKey.length < 36
          },
          on: {
            input: value => {
              this.error = false;
              this.errorMessage = "";

              this.confirmKey = value;
            }
          }
        },
        [
          h("div", { staticClass: "multiline-hint", slot: "hint" }, [
            this.__hint(h)
          ]),
          h("div", { staticClass: "multiline-hint", slot: "error" }, [
            this.__errorMessage(h)
          ])
        ]
      );
    },

    /**
     * Рендер подсказки для инпута ключа подтверждения email адреса
     */
    __hint(h) {
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

    __errorMessage(h) {
      const node = this.error ? this.errorMessage : this.__hint(h);
      return h("span", node);
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
          const { success, error } = await userAPI.settings(
            "resendEmailConfirmationKey",
            {
              id: this.userInstance.id
            }
          );

          if (error) {
            return controllers.handleErrors(error);
          }

          controllers.successNotify(success);
        });
    }
  },

  render(h) {
    if (this.userInstance.metadata.emailVerification) {
      return h(
        "form",
        {
          attrs: {
            autocomplete: false
          },
          on: {
            submit: e => {
              e.preventDefault();
              this.submit();
            }
          }
        },
        [
          this.__input(h),
          h(
            "q-btn",
            {
              staticClass: "float-right q-my-lg",
              class: {
                loading: this.sending
              },
              attrs: {
                label: this.$t("labels.confirm"),
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
          )
        ]
      );
    }
  }
};
</script>
