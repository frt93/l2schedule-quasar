<script>
import auth from "mixin/auth";
export default {
  name: "signupComponent",
  mixins: [auth],
  data() {
    return {
      username: "",
      email: "",
      password: "",
      hidePwd: true
    };
  },

  computed: {
    user() {
      return {
        username: this.username,
        email: this.email,
        password: this.password
      };
    },

    /**
     * Проверяем готовность формы к отправке.
     * Если все поля заполнены и соблюдены нормы по длине никнейма и паролей - запускаем метод валидации формы.
     */
    canSubmit() {
      if (
        !this.username.length ||
        this.username.length > 16 ||
        !this.email.length ||
        (this.password.length < 7 || this.password.length > 30)
      ) {
        return false;
      } else {
        return this.validateForm();
      }
    }
  },

  methods: {
    submit() {
      this.$store
        .dispatch("auth/signUp", this.user)
        .then(res => {})
        .catch(e => {
          this.handleErrors(e.response.data);
        });
    }
  },

  render(h) {
    return h(
      "div",
      {
        class: "q-pa-md"
      },
      [
        h(
          "q-form",
          {
            class: "q-gutter-md",
            on: {
              submit: () => {
                this.submit();
              }
            }
          },
          [
            h(
              "q-input",
              {
                attrs: {
                  autofocus: true,
                  autocomplete: "off",
                  maxlength: "16",
                  value: this.username,
                  label: "Никнейм",
                  hint: "Максимум 16 символов",
                  counter: true,
                  error: this.usernameError,
                  errorMessage: this.usernameErrorMessage,
                  loading: this.loading.username
                },
                on: {
                  input: value => {
                    this.username = value;
                    this.loading.username = true;
                    this.validateUsername(value);
                  }
                }
              },
              [
                h("q-spinner-puff", {
                  props: {
                    color: this.usernameError ? "negative" : "primary"
                  },
                  slot: "loading"
                })
              ]
            ),
            h(
              "q-input",
              {
                attrs: {
                  autocomplete: "off",
                  type: "email",
                  value: this.email,
                  label: "Email",
                  hint: "На указанный адрес придет письмо для подтверждения",
                  error: this.emailError,
                  errorMessage: this.emailErrorMessage,
                  loading: this.loading.email
                },
                on: {
                  input: value => {
                    this.email = value;
                    this.loading.email = true;
                    this.validateEmail(value);
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
              "q-input",
              {
                attrs: {
                  autocomplete: "off",
                  maxlength: "30",
                  type: this.hidePwd ? "password" : "text",
                  value: this.password,
                  label: "Пароль",
                  hint: "От 7 до 30 символов",
                  counter: true,
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
                h("q-icon", {
                  class: "cursor-pointer",
                  slot: "append",
                  props: {
                    name: this.hidePwd ? "visibility_off" : "visibility"
                  },
                  on: {
                    click: () => {
                      this.hidePwd = !this.hidePwd;
                    }
                  }
                })
              ]
            ),
            h("q-btn", {
              attrs: {
                label: "Зарегистрироваться",
                type: "submit",
                color: this.canSubmit ? "green-6" : "red-6",
                disabled: !this.canSubmit
              },
              props: {}
            })
          ]
        )
      ]
    );
  }
};
</script>

<style>
.q-field__messages {
  white-space: pre;
  line-height: 1.5;
}
</style>