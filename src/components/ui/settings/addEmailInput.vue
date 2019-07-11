<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

export default {
  name: "addEmailInput",
  props: ["user"],

  data() {
    return {
      email: "",
      error: false,
      errorMessage: "",

      loading: false,
      sending: false
    };
  },

  computed: {
    canSubmit() {
      return this.error || this.loading || this.sending || !this.email.length
        ? false
        : true;
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        const payload = {
          id: this.user.id,
          email: this.email
        };

        this.sending = true;
        const { user, success, error } = await userAPI.settings(
          "change/email",
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

  watch: {
    email: debounce(async function(email) {
      this.error = false;
      this.errorMessage = "";

      if (email.length) {
        const { message } = await controllers.checkEmail(email);
        if (message) {
          this.error = true;
          this.errorMessage = message;
        }
      }

      this.loading = false;
    }, 1500)
  },

  render(h) {
    if (!this.user.email)
      return h(
        "form",
        {
          on: {
            submit: e => {
              e.preventDefault();
              this.submit();
            }
          }
        },
        [
          h(
            "q-input",
            {
              attrs: {
                autocomplete: false,
                value: this.email,
                label: this.$t("labels.email"),
                hint: this.$t("hints.settings.addEmail"),
                error: this.error || !this.email.length,
                errorMessage:
                  this.errorMessage || this.$t("hints.settings.addEmail"),
                loading: this.loading
              },
              on: {
                input: value => {
                  this.email = value;
                  this.loading = true;
                }
              }
            },
            [
              h("q-spinner-puff", {
                attrs: {
                  color: this.error ? "negative" : "primary"
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
                label: this.$t("labels.add"),
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
};
</script>
