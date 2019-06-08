<script>
import auth from "mixin/auth";
export default {
  name: "repairPasswordComponent",
  mixins: [auth],
  data() {
    return {
      step: 1,
      repairKey: "",
      repairKeyError: false,
      repairKeyErrorMessage: ""
    };
  },

  computed: {
    canNext() {
      if (this.step === 1) {
        this.repairKeyError = false;
        this.repairKeyErrorMessage = this.repairKey = "";
        return !this.email.length || this.emailError || this.loading.email
          ? false
          : true;
      }
      if (this.step === 2) {
        this.emailError = false;
        this.emailErrorMessage = this.email = "";
        return !this.repairKey.length ||
          this.repairKey.length !== 36 ||
          this.repairKeyError
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

    firstStep() {
      this.$axios
        .post("/users/repair", { email: this.email })
        .then(res => {
          if (res.data === true) {
            this.step = 2;
          }
        })
        .catch(e => {
          this.handleErrors(e);
        });
    },

    secondStep() {
      this.$axios
        .post("/users/confirm-repair", { key: this.repairKey })
        .then(res => {
          this.email = res.data;
          this.step = 3; // Принудительно инкрементируем шаг, чтобы разблокировать третий этап
          this.$refs.stepper.next();
        })
        .catch(e => {
          this.handleErrors(e);
        });
    },

    lastStep() {
      this.$axios
        .post("/users/repair/change-password", {
          email: this.email,
          password: this.password,
          key: this.repairKey
        })
        .then(res => {
          this.$router.push({ name: "signin" });
        })
        .catch(e => {
          this.handleErrors(e);
        });
    },

    /**
     * Отрисовка первого шага
     */
    __QStep1(h) {
      return h(
        "q-step",
        {
          attrs: {
            name: 1,
            color: this.emailError ? "negative" : "warning",
            title: "Enter your email adress",
            done: this.step > 1 ? true : false,
            doneColor: "green-6"
          }
        },
        [
          this._v(
            "Для запуска процесса восстановления доступа к своему аккаунту введите email адрес, который вы указывали при регистрации. На него будет отправлено письмо с ключом подтверждения операции"
          ),
          h(
            "q-input",
            {
              attrs: {
                autofocus: true,
                autocomplete: false,
                placeholder: "youremail@adress.com",
                value: this.email,
                error: this.emailError,
                errorMessage: this.emailErrorMessage,
                loading: this.loading.email
              },
              on: {
                input: value => {
                  this.email = value;
                  this.loading.email = true;
                  this.validateEmail(value, false);
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
     * Отрисовка второго шага
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
          this._v(
            "Введите ключ подтверждения из письма, которое пришло на ваш электронный адрес"
          ),
          h(
            "q-input",
            {
              attrs: {
                autofocus: true,
                autocomplete: false,
                maxlength: 36,
                placeholder: "Например, 133caea8-c3ad-490c-b70f-8eb0f4c29639",
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
                h("q-spinner-puff", {
                  attrs: {
                    color: this.repairKeyError ? "negative" : "primary"
                  },
                  slot: "loading"
                }),
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
     * Отрисовка третьего и последнего шага
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
          this._v(
            "Теперь можете указать ваш новый пароль. После подтверждения вы будете перенаправлены на страницу авторизации"
          ),
          h(
            "q-input",
            {
              attrs: {
                autofocus: true,
                autocomplete: false,
                type: this.hidePwd ? "password" : "text",
                maxlength: 30,
                counter: true,
                hint: "От 7 до 30 символов",
                value: this.password,
                error: this.passwordError,
                errorMessage: this.passwordErrorMessage
              },
              on: {
                input: value => {
                  this.password = value;
                  this.validatePassword(value);
                }
              }
            },
            [
              [
                h("q-spinner-puff", {
                  attrs: {
                    color: this.passwordError ? "negative" : "primary"
                  },
                  slot: "loading"
                }),
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
     * Отрисовка слота навигации
     */
    __navigationSlot(h) {
      let buttons = [
        h("q-btn", {
          staticClass: "float-right",
          attrs: {
            color: this.canNext ? "green-6" : "red-6",
            label: this.step === 3 ? "Подтвердить" : "Далее",
            disabled: !this.canNext
          },
          on: {
            click: () => {
              this.nextStep();
            }
          }
        })
      ];

      if (this.step > 1) {
        buttons.push(
          h("q-btn", {
            staticClass: "q-mr-sm float-left",
            attrs: {
              flat: true,
              color: "red-6",
              label: "Назад"
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
              label: "Уже есть ключ?"
            },
            on: {
              click: () => {
                this.step = 2;
              }
            }
          })
        );
      }

      return h("q-stepper-navigation", { slot: "navigation" }, buttons);
    }
  },

  render(h) {
    return h(
      "q-stepper",
      {
        staticClass: "q-pb-xl",
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
    );
  }
};
</script>