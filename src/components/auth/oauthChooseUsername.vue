

<script>
import { debounce } from "quasar";

import controllers from "handlers/user/controllers";

export default {
  data() {
    return {
      username: "",
      error: false,
      errorMessage: "",
      loading: false
    };
  },

  props: ["message"],

  computed: {
    canSubmit() {
      return this.loading || this.error || !this.username.length ? false : true;
    }
  },

  methods: {
    show() {
      this.$refs.dialog.show();
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      this.$emit("hide");
    },

    onConfirm() {
      this.$emit("ok", this.username);
      this.hide();
    },

    onCancel() {
      this.hide();
    }
  },

  watch: {
    username: debounce(async function(username) {
      this.error = false;
      this.errorMessage = "";

      if (username.length) {
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
      "q-dialog",
      {
        ref: "dialog",
        props: { persistent: true },
        on: {
          hide: () => {
            this.onDialogHide();
          }
        }
      },
      [
        h(
          "q-card",
          {
            staticClass: "q-dialog-plugin",
            style: "width: 700px; max-width: 80vw"
          },
          [
            h("q-toolbar", [
              h("q-toolbar-title", this.$t("errors.chooseUsername")),
              h("q-btn", {
                props: {
                  flat: true,
                  round: true,
                  ripple: false,
                  icon: "mdi-close"
                },
                on: {
                  click: () => {
                    this.onCancel();
                  }
                }
              })
            ]),
            h("q-card-section", [
              this._v(this.message),
              h(
                "form",
                {
                  on: {
                    submit: e => {
                      e.preventDefault();
                      if (this.canSubmit) {
                        this.onConfirm();
                      }
                    }
                  }
                },
                [
                  h(
                    "q-input",
                    {
                      attrs: {
                        autofocus: true,
                        autocomplete: false,
                        maxlength: "16",
                        value: this.username,
                        hint: this.$t("hints.auth.username"),
                        counter: true,
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
                        props: {
                          color: this.error ? "negative" : "primary"
                        },
                        slot: "loading"
                      })
                    ]
                  ),
                  h("q-btn", {
                    staticClass: "q-my-md float-right",
                    attrs: {
                      type: "submit",
                      color: this.canSubmit ? "green-6" : "red-6",
                      disable: !this.canSubmit,
                      label: "ok"
                    }
                  })
                ]
              )
            ])
          ]
        )
      ]
    );
  }
};
</script>