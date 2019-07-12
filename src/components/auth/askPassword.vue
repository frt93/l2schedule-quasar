 

<script>
import { debounce } from "quasar";

import controllers from "handlers/user/controllers";

export default {
  beforeMount() {
    if (this.isError) this.error = true;
  },

  props: ["isError"],
  data() {
    return {
      password: "",
      error: false,
      errorMessage: "",
      hidePwd: true
    };
  },

  computed: {
    canSubmit() {
      return this.error || this.password.length < 7 || this.password.length > 30
        ? false
        : true;
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
      this.$emit("ok", this.password);
      this.hide();
    },

    onCancel() {
      this.hide();
    }
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
              h("q-toolbar-title", this.$t("labels.password")),
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
              this.$t("hints.auth.confirmOperation"),
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
                        type: this.hidePwd ? "password" : "text",
                        maxlength: 30,
                        value: this.password,
                        counter: true,
                        error: this.error,
                        errorMessage: this.errorMessage || this.isError
                      },
                      on: {
                        input: value => {
                          this.error = false;
                          this.errorMessage = "";

                          this.password = value;
                          this.errorMessage = controllers.validatePassword(
                            value
                          );

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
                          name: this.hidePwd ? "mdi-eye-off" : "mdi-eye"
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
                  h("q-btn", {
                    staticClass: "q-my-md float-right",
                    attrs: {
                      type: "submit",
                      color: this.canSubmit ? "green-6" : "red-6",
                      disable: !this.canSubmit,
                      label: this.$t("labels.confirm")
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