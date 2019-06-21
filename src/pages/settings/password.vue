

<script>
import auth from "mixin/auth";
import api from "handlers/user/api";
export default {
  name: "passwordSettingsPage",
  mixins: [auth],
  props: ["userInstance"],

  data() {
    return {
      currentPassword: "",
      newPassword: "",
      hidePwd2: true
    };
  },

  computed: {
    canSubmit() {
      return this.currentPassword.length >= 7 &&
        this.newPassword.length >= 7 &&
        (this.currentPassword.length <= 30 && this.newPassword.length <= 30) &&
        !this.passwordError &&
        !this.newPasswordError
        ? true
        : false;
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        const payload = {
          current: this.currentPassword,
          new: this.newPassword,
          id: this.userInstance.id
        };
        const { success, error } = await api.submitPasswordSettings(payload);
        if (error) {
          return this.handleErrors(error);
        }

        this.successNotify(success);
        this.currentPassword = this.newPassword = "";
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
      title: this.$t("titles.settings.password"),
      titleTemplate: title =>
        `${title} - ${this.$t("titles.settings.main")} - L2Schedule`
    };
  },

  render(h) {
    return h("div", { staticClass: "form" }, [
      h(
        "q-input",
        {
          attrs: {
            autofocus: true,
            autocomplete: false,
            type: this.hidePwd ? "password" : "text",
            maxlength: 30,
            counter: true,
            value: this.currentPassword,
            label: this.$t("labels.currentPassword"),
            error: this.passwordError,
            errorMessage: this.passwordErrorMessage
          },
          on: {
            input: value => {
              this.currentPassword = value;
              this.validatePassword(value);
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
          }),
          h()
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
              this.newPassword = value;
              this.validatePassword(value, true);
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
