<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

export default {
  name: "addPasswordInput",
  props: ["userInstance"],

  data() {
    return {
      password: "",
      error: false,
      errorMessage: "",

      hidePwd: true,
      sending: false
    };
  },

  computed: {
    canSubmit() {
      return this.password.length < 7 || this.password.length > 30 || this.error
        ? false
        : true;
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        const payload = {
          id: this.userInstance.id,
          password: this.password
        };

        this.sending = true;
        const { user, success, error } = await userAPI.settings(
          "addpassword",
          payload
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
    }
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
            value: this.password,
            label: this.$t("labels.password"),
            hint: this.$t("hints.settings.addPassword"),
            error:
              this.error ||
              this.password.length < 7 ||
              this.password.length > 30,
            errorMessage:
              this.errorMessage || this.$t("hints.settings.addPassword")
          },
          on: {
            input: value => {
              this.error = false;
              this.errorMessage = "";

              this.password = value;
              this.errorMessage = controllers.validatePassword(value);

              if (this.errorMessage) {
                this.error = true;
              }
            }
          }
        },
        [
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
      )
    ]);
  }
};
</script>
