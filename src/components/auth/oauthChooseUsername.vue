

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

  props: ["message", "title"],

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit("hide");
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit("ok");
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
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
              h("q-toolbar-title", this.title),
              h("q-btn", {
                props: {
                  flat: true,
                  round: true,
                  ripple: false,
                  icon: "fas fa-times"
                },
                on: {
                  click: () => {
                    this.onCancelClick();
                  }
                }
              })
            ]),
            h("q-card-section", [
              this._v(this.message),
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
              )
            ]),
            h("q-card-actions", { attrs: { align: "right" } }, [
              h("q-btn", {
                attrs: { color: "primary", label: "ok" },
                on: {
                  click: () => {
                    this.onOKClick();
                  }
                }
              })
            ])
          ]
        )
      ]
    );
  }
};
</script>