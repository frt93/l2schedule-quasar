<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

export default {
  name: "setEmailComponent",
  props: ["userInstance"],

  data() {
    return {
      email: "",
      emailError: false,
      emailErrorMessage: "",

      emailLoading: false,
      sending: false
    };
  },

  computed: {
    canSubmit() {
      return this.emailError || this.emailLoading || !this.email.length
        ? false
        : true;
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        const payload = {
          id: this.userInstance.id,
          email: this.email
        };

        this.sending = true;
        const { user, success, error } = await userAPI.submitSafetySettings(
          payload
        );
        this.sending = false;

        if (error) {
          const { errorType, message } = controllers.handleErrors(error);
          this[errorType] = true;
          this[`${errorType}Message`] = message;

          return;
        }
        // Устанавливаем новый инстанс пользователя
        this.$store.commit("user/setUser", user);

        controllers.successNotify(success);
      }
    }
  },

  watch: {
    email: debounce(async function(email) {
      this.emailError = false;
      this.emailErrorMessage = "";

      if (email.length) {
        const { message } = await controllers.checkEmail(email);
        if (message) {
          this.emailError = true;
          this.emailErrorMessage = message;
        }
      }

      this.emailLoading = false;
    }, 1500)
  },

  render(h) {
    if (!this.userInstance.email)
      return h("div", [
        h(
          "q-input",
          {
            attrs: {
              autocomplete: false,
              value: this.email,
              label: this.$t("labels.email"),
              hint: this.$t("hints.settings.safety.enterEmail"),
              error: this.emailError || !this.email.length,
              errorMessage:
                this.emailErrorMessage ||
                this.$t("hints.settings.safety.enterEmail"),
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
