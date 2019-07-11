<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

import askPassword from "components/auth/askPassword";

export default {
  name: "changeEmailInput",
  props: ["user"],
  data() {
    return {
      email: this.user.email,
      error: false,
      errorMessage: "",

      loading: false,
      sending: false
    };
  },

  computed: {
    canSubmit() {
      return this.email !== this.user.email && !this.error && !this.loading
        ? true
        : false;
    }
  },

  methods: {
    askPassword(error) {
      this.$q
        .dialog({
          component: askPassword,
          root: this.$root,
          isError: error
        })
        .onOk(password => {
          this.submit(password);
        });
    },

    async submit(password) {
      if (this.canSubmit) {
        const payload = {
          id: this.user.id,
          email: this.email,
          password
        };

        this.sending = true;
        const { user, success, error } = await userAPI.settings(
          "change/email",
          payload
        );
        this.sending = false;

        if (error) {
          const { errorType, message } = controllers.handleErrors(error);
          if (errorType === "passwordError") {
            this.askPassword(message);
          }

          return;
        }
        // Устанавливаем новый инстанс пользователя
        this.$store.commit("user/setUser", user);

        controllers.successNotify(success);
      }
    },

    __hint(h) {
      const name =
        this.user.password === null
          ? "hints.settings.needPasswordToChange"
          : "hints.settings.email";

      return this.$t(name);
    }
  },

  watch: {
    email: debounce(async function(email) {
      this.error = false;
      this.errorMessage = "";

      if (email.length && email !== this.user.email) {
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
    if (this.user.email) {
      return h(
        "form",
        {
          on: {
            submit: e => {
              e.preventDefault();
              if (this.canSubmit) {
                this.askPassword();
              }
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
                readonly: this.user.password === null ? true : false,
                error: this.error,
                errorMessage: this.errorMessage,
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
              }),
              h("div", { slot: "hint" }, [this.__hint(h)]),
              h(
                "q-btn",
                {
                  slot: "append",
                  attrs: {
                    type: "submit",
                    round: true,
                    flat: true,
                    icon: "mdi-cached",
                    color: this.canSubmit ? "green-6" : "red-6",
                    disable: !this.canSubmit,
                    loading: this.sending
                  }
                },
                [
                  h("q-no-ssr", [
                    h(
                      "q-tooltip",
                      {
                        attrs: {
                          transitionShow: "scale",
                          transitionHide: "scale"
                        }
                      },
                      this.$t("labels.save")
                    )
                  ])
                ]
              )
            ]
          )
        ]
      );
    }
  }
};
</script>
