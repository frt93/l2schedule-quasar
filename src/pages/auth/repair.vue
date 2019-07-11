<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
export default {
  name: "repairPasswordPage",
  meta() {
    return {
      title: this.$t("titles.authRepair"),
      titleTemplate: title => `${title} - L2Schedule`
    };
  },

  data() {
    return {
      step: 1,

      email: "",
      password: "",
      repairKey: "",

      emailError: false,
      repairKeyError: false,
      passwordError: false,

      emailErrorMessage: "",
      repairKeyErrorMessage: "",
      passwordErrorMessage: "",

      user: this.$store.state.user.instance,

      loading: false,
      sending: false
    };
  },

  computed: {
    canNext() {
      if (this.step === 1) {
        this.repairKeyError = false;
        this.repairKeyErrorMessage = this.repairKey = "";
        if (this.user !== null) {
          /**
           * Если пользователь авторизован (и скорее всего переадресован со страницы смены пароля в настройках)
           * значит письмо должно быть отправлено на его почтовый адрес, который автоматически подставится в инпут. Следовательно кнопка должна быть разблокирована для отправки письма
           */

          return true;
        } else {
          return !this.email.length || this.emailError || this.loading
            ? false
            : true;
        }
      }
      if (this.step === 2) {
        this.emailError = false;
        this.emailErrorMessage = this.email = "";
        return this.repairKey.length !== 36 || this.repairKeyError
          ? false
          : true;
      }
      if (this.step === 3) {
        return this.password.length < 7 ||
          this.password.length > 30 ||
          this.passwordError
          ? false
          : true;
      }
      return false;
    }
  },

  methods: {
    nextStep() {
      if (this.step === 1) {
        this.firstStep();
      }
      if (this.step === 2) {
        this.secondStep();
      }
      if (this.step === 3) {
        this.lastStep();
      }
    },

    async firstStep() {
      const email = this.user !== null ? this.user.email : this.email;
      this.sending = true;
      const { response, error } = await userAPI.repairFirstStep(email);
      this.sending = false;

      if (error) {
        const { message } = controllers.handleErrors(error);
        this.emailError = true;
        this.emailErrorMessage = message;

        return;
      }

      this.step = 2;
    },

    async secondStep() {
      this.sending = true;
      const { email, error } = await userAPI.repairSecondStep(this.repairKey);
      this.sending = false;

      if (error) {
        const { message } = controllers.handleErrors(error);
        this.repairKeyError = true;
        this.repairKeyErrorMessage = message;

        return;
      }

      this.email = email;
      this.step = 3;
      this.$refs.stepper.next();
    },

    async lastStep() {
      this.sending = true;

      const credentials = {
        email: this.email,
        password: this.password,
        key: this.repairKey
      };
      const { response, success, error } = await userAPI.repairThirdStep(
        credentials
      );
      this.sending = false;

      if (error) {
        const { message } = controllers.handleErrors(error);
        this.passwordError = true;
        this.passwordErrorMessage = message;

        return;
      }

      const redirectTo = this.user !== null ? "home" : "signin";
      this.$router.push({ name: redirectTo });
      this.successNotify(success);
    },

    /**
     * Рендер первого шага
     */
    __QStep1(h) {
      return h(
        "q-step",
        {
          attrs: {
            name: 1,
            color: this.emailError ? "negative" : "warning",
            title: "Enter your email",
            done: this.step > 1 ? true : false,
            doneColor: "green-6"
          }
        },
        [
          this._v(
            this.$t(this.user ? "labels.repair.user1" : "labels.repair.guest1")
          ),
          h(
            "q-input",
            {
              attrs: {
                autofocus: true,
                autocomplete: false,
                readonly: this.user !== null ? true : false,
                placeholder: "youremail@adress.com",
                value: this.user !== null ? this.user.email : this.email,
                error: this.emailError,
                errorMessage: this.emailErrorMessage,
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
                  color: this.emailError ? "negative" : "primary"
                },
                slot: "loading"
              }),
              h("q-icon", {
                attrs: {
                  name: "fas fa-envelope"
                },
                slot: "prepend"
              })
            ]
          )
        ]
      );
    },

    /**
     * Рендер второго шага
     */
    __QStep2(h) {
      return h(
        "q-step",
        {
          attrs: {
            name: 2,
            color: this.repairKeyError ? "negative" : "warning",
            icon: "fas fa-key",
            title: "Enter repair key",
            done: this.step > 2 ? true : false,
            doneColor: "green-6",
            disable: this.step < 2 ? true : false
          }
        },
        [
          this._v(this.$t("labels.repair.2")),
          ,
          h(
            "q-input",
            {
              attrs: {
                autofocus: true,
                autocomplete: false,
                maxlength: 36,
                counter: true,
                placeholder: `${this.$t(
                  "eg"
                )}, 133caea8-c3ad-490c-b70f-8eb0f4c29639`,
                value: this.repairKey,
                error: this.repairKeyError,
                errorMessage: this.repairKeyErrorMessage
              },
              on: {
                input: value => {
                  this.repairKey = value;
                  this.repairKeyError = false;
                  this.repairKeyErrorMessage = "";
                }
              }
            },
            [
              [
                h("q-icon", {
                  attrs: {
                    name: "fas fa-key"
                  },
                  slot: "prepend"
                })
              ]
            ]
          )
        ]
      );
    },

    /**
     * Рендер третьего и последнего шага
     */
    __QStep3(h) {
      return h(
        "q-step",
        {
          attrs: {
            name: 3,
            color: this.passwordError ? "negative" : "warning",
            icon: "fas fa-unlock",
            title: "Choose your new password",
            disable: this.step < 3 ? true : false
          }
        },
        [
          this._v(this.$t("labels.repair.3")),
          h(
            "q-input",
            {
              attrs: {
                autofocus: true,
                autocomplete: false,
                type: this.hidePwd ? "password" : "text",
                maxlength: 30,
                counter: true,
                hint: this.$t("hints.auth.password"),
                value: this.password,
                error: this.passwordError,
                errorMessage: this.passwordErrorMessage
              },
              on: {
                input: value => {
                  this.passwordError = false;
                  this.passwordErrorMessage = "";

                  this.password = value;
                  this.passwordErrorMessage = controllers.validatePassword(
                    value
                  );

                  if (this.passwordErrorMessage) {
                    this.passwordError = true;
                  }
                }
              }
            },
            [
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
                }),
                h("q-icon", {
                  attrs: {
                    name:
                      this.password.length < 7 ? "fas fa-unlock" : "fas fa-lock"
                  },
                  slot: "prepend"
                })
              ]
            ]
          )
        ]
      );
    },

    /**
     * Рендер слота навигации
     */
    __navigationSlot(h) {
      let buttons = [
        h(
          "q-btn",
          {
            staticClass: "float-right",
            class: {
              loading: this.sending
            },
            attrs: {
              color: this.canNext ? "green-6" : "red-6",
              label:
                this.step === 3
                  ? this.$t("labels.save")
                  : this.$t("labels.next"),
              loading: this.sending,
              disable: !this.canNext
            },
            on: {
              click: () => {
                this.nextStep();
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
      ];

      if (this.step > 1) {
        buttons.push(
          h("q-btn", {
            staticClass: "q-mr-sm float-left",
            attrs: {
              flat: true,
              color: "red-6",
              label: this.$t("labels.back")
            },
            on: {
              click: () => {
                this.step -= 1;
              }
            }
          })
        );
      }

      if (this.step === 1) {
        buttons.push(
          h("q-btn", {
            staticClass: "float-left",
            attrs: {
              color: "green-6",
              label: this.$t("labels.haveKey")
            },
            on: {
              click: () => {
                this.step = 2;
              }
            }
          })
        );
      }

      return h(
        "q-stepper-navigation",
        { staticClass: "q-mt-sm", slot: "navigation" },
        buttons
      );
    }
  },

  watch: {
    email: debounce(async function(email) {
      this.emailError = false;
      this.emailErrorMessage = "";

      this.emailErrorMessage = controllers.validateEmail(email);
      if (this.emailErrorMessage) {
        this.emailError = true;
      }

      this.loading = false;
    }, 1500)
  },

  render(h) {
    return h("q-page", [
      h(
        "q-stepper",
        {
          staticClass: "q-pb-xl",
          ref: "stepper",
          attrs: {
            flat: true,
            contracted: true,
            animated: true,
            transitionPrev: "fade",
            transitionNext: "fade",
            value: this.step
          }
        },
        [
          this.__QStep1(h),
          this.__QStep2(h),
          this.__QStep3(h),
          this.__navigationSlot(h)
        ]
      )
    ]);
  }
};
</script>