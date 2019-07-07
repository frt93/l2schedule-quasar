

<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

import addPassword from "components/ui/settings/addPasswordInput";

export default {
  name: "passwordSettingsPage",
  meta() {
    return {
      title: this.$t("titles.settings.password"),
      titleTemplate: title =>
        `${title} - ${this.$t("titles.settings.main")} - L2Schedule`
    };
  },

  props: ["userInstance"],
  data() {
    return {
      password: "",
      newPassword: "",

      passwordError: false,
      newPasswordError: false,

      passwordErrorMessage: "",
      newPasswordErrorMessage: "",

      hidePwd: true,
      hidePwd2: true,
      sending: false
    };
  },

  computed: {
    canSubmit() {
      return this.password.length >= 7 &&
        this.newPassword.length >= 7 &&
        (this.password.length <= 30 && this.newPassword.length <= 30) &&
        !this.passwordError &&
        !this.newPasswordError
        ? true
        : false;
    },

    payload() {
      return {
        current: this.password,
        new: this.newPassword,
        id: this.userInstance.id
      };
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        const { success, error } = await userAPI.settings(
          "password",
          this.payload
        );

        if (error) {
          const { errorType, message } = controllers.handleErrors(error);
          this[errorType] = true;
          this[`${errorType}Message`] = message;

          return;
        }

        controllers.successNotify(success);
        this.password = this.newPassword = "";
      }
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
    return this.userInstance.password === null
      ? h(addPassword, { props: { userInstance: this.userInstance } })
      : h("div", { staticClass: "form" }, [
          h(
            "q-input",
            {
              attrs: {
                autofocus: true,
                autocomplete: false,
                type: this.hidePwd ? "password" : "text",
                maxlength: 30,
                counter: true,
                value: this.password,
                label: this.$t("labels.currentPassword"),
                error: this.passwordError,
                errorMessage: this.passwordErrorMessage
              },
              on: {
                input: value => {
                  this.passwordError = false;
                  this.passwordErrorMessage = "";

                  this.password = value;
                  this.passwordErrorMessage = controllers.validatePassword(
                    value
                  );

                  if (this.passwordErrorMessage) {
                    this.passwordError = true;
                  }
                }
              }
            },
            [
              h("div", { slot: "hint" }, [
                h(
                  "span",
                  {
                    staticClass: "cursor-pointer dashed",
                    on: {
                      click: () => {
                        this.$router.push({ name: "repair" });
                      }
                    }
                  },
                  this.$t("labels.forgot")
                )
              ]),
              h("q-icon", {
                staticClass: "cursor-pointer q-ml-sm",
                attrs: {
                  name: this.hidePwd ? "fas fa-eye" : "fas fa-eye-slash"
                },
                on: {
                  click: () => {
                    this.hidePwd = !this.hidePwd;
                  }
                },
                slot: "append"
              })
            ]
          ),

          h(
            "q-input",
            {
              attrs: {
                autocomplete: false,
                type: this.hidePwd2 ? "password" : "text",
                maxlength: 30,
                counter: true,
                value: this.newPassword,
                label: this.$t("labels.newPassword"),
                hint: this.$t("hints.auth.password"),
                error: this.newPasswordError,
                errorMessage: this.newPasswordErrorMessage
              },
              on: {
                input: value => {
                  this.newPasswordError = false;
                  this.newPasswordErrorMessage = "";

                  this.newPassword = value;
                  this.newPasswordErrorMessage = controllers.validatePassword(
                    value
                  );

                  if (this.newPasswordErrorMessage) {
                    this.newPasswordError = true;
                  }
                }
              }
            },
            [
              h("q-icon", {
                staticClass: "cursor-pointer q-ml-sm",
                attrs: {
                  name: this.hidePwd2 ? "fas fa-eye" : "fas fa-eye-slash"
                },
                on: {
                  click: () => {
                    this.hidePwd2 = !this.hidePwd2;
                  }
                },
                slot: "append"
              })
            ]
          ),

          this.__submitButton(h)
        ]);
  }
};
</script>
