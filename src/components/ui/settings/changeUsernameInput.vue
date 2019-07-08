<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";

import passwordDialog from "components/auth/askPassword";
export default {
  name: "changeUsernameInput",
  props: ["user"],
  data() {
    return {
      username: this.user.username,
      error: false,
      errorMessage: "",

      loading: false,
      sending: false
    };
  },

  computed: {
    canSubmit() {
      return this.username !== this.user.username &&
        !this.error &&
        !this.loading
        ? true
        : false;
    }
  },

  methods: {
    askPassword(error) {
      this.$q
        .dialog({
          component: passwordDialog,
          root: this.$root,
          isError: error
        })
        .onOk(async password => {
          this.submit(password);
        });
    },

    async submit(password) {
      if (this.canSubmit) {
        const payload = {
          id: this.user.id,
          username: this.username,
          password
        };

        this.sending = true;
        const { user, success, error } = await userAPI.settings(
          "change/username",
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
      let hint = `localhost/@${this.username}`;

      if (this.user.password === null) {
        hint += `. ${this.$t("hints.settings.needPasswordToChange")}`;
      }

      return hint;
    }
  },

  watch: {
    username: debounce(async function(username) {
      this.error = false;
      this.errorMessage = "";

      if (username.length && username !== this.user.username) {
        const { message } = await controllers.checkUsername(username);

        if (message) {
          this.error = true;
          this.errorMessage = message;
        }
      }

      this.loading = false;
    }, 1500)
  },

  render(h) {
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
              value: this.username,
              label: this.$t("labels.username"),
              readonly: this.user.password === null ? true : false,
              error: this.error,
              errorMessage: this.errorMessage,
              loading: this.loading
            },
            on: {
              input: value => {
                this.username = value;
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
};
</script>
