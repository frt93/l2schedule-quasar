<script>
import { debounce } from "quasar";

import partyAPI from "handlers/party/api";
import controllers from "handlers/party/controllers";
export default {
  name: "createPartyDialog",
  props: ["user"],
  data() {
    return {
      name: "",
      slug: "",
      nameError: false,
      nameErrorMessage: "",
      slugError: false,
      slugErrorMessage: "",
      loading: {
        name: false,
        slug: false
      },
      sending: false
    };
  },

  computed: {
    payload() {
      return {
        name: this.name,
        slug: this.slug,
        userID: this.user.id
      };
    },
    canSubmit() {
      return this.loading.name ||
        this.loading.slug ||
        this.nameError ||
        this.slugError ||
        !this.name.length ||
        this.name.length > 30 ||
        !this.slug.length ||
        this.slug.length > 20
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

    async onConfirm() {
      const { party, user, error } = await partyAPI.create(this.payload);
      if (error) {
        console.log(error.response);
        return;
      }
      // Устанавливаем новый инстанс пользователя
      this.$store.commit("user/setUser", user);
      //@todo коммит в модуль пати
      this.$emit("ok");
      this.hide();
    },

    onCancel() {
      this.hide();
    }
  },

  watch: {
    name: debounce(async function(name) {
      this.nameError = false;
      this.nameErrorMessage = "";

      if (name.length) {
        const { message } = await controllers.checkName(name);

        if (message) {
          this.nameError = true;
          this.nameErrorMessage = message;
        }
      }
      this.loading.name = false;
    }, 1500),

    slug: debounce(async function(slug) {
      this.slugError = false;
      this.slugErrorMessage = "";

      if (slug.length) {
        const { message } = await controllers.checkSlug(slug);

        if (message) {
          this.slugError = true;
          this.slugErrorMessage = message;
        }
      }
      this.loading.slug = false;
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
              h("q-toolbar-title", this.$t("party.createDialogTitle")),
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
                        autocomplete: false,
                        maxlength: "30",
                        value: this.name,
                        label: this.$t("party.labels.name"),
                        counter: true,
                        error: this.nameError,
                        errorMessage: this.nameErrorMessage,
                        loading: this.loading.name
                      },
                      on: {
                        input: value => {
                          this.name = value;
                          this.loading.name = true;
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
                  h(
                    "q-input",
                    {
                      attrs: {
                        autocomplete: false,
                        maxlength: "20",
                        prefix: `${process.env.APP_URL}party/`,
                        value: this.slug,
                        label: this.$t("party.labels.slug"),
                        hint: this.$t("party.hints.slug", { and: "-" }),
                        counter: true,
                        error: this.slugError,
                        errorMessage: this.slugErrorMessage,
                        loading: this.loading.slug
                      },
                      on: {
                        input: value => {
                          this.slug = value;
                          this.loading.slug = true;
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
 
 <style lang="stylus" scope>
 .q-field__prefix {
   padding-right: 0;
   color: rgba(0, 0, 0, 0.54);
 }
</style>
 