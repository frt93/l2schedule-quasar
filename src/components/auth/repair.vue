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
          !this.repairKey.length === 36 ||
          this.repairKeyError ||
          this.loading.repair
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
    },

    firstStep() {
      this.$axios
        .post("/users/repair", { email: this.email })
        .then(res => {
          if (res.data === "success") {
            this.$refs.stepper.next();
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
            attrs: {
              autocomplete: "off"
            },
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
                  autocomplete: "off",
                  value: this.email,
                  label: "Email",
                  error: this.emailError,
                  errorMessage: this.emailErrorMessage,
                  loading: this.loading.email
                },
                on: {
                  input: value => {
                    this.email = value;
                    this.loading.email = true;
                    this.validateEmail(value, "repair");
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
        )
      ]
    );
  }
};
</script>
<template>
  <div class="q-pa-md">
    <q-stepper v-model="step" ref="stepper" contracted color="primary" animated>
      <q-step
        :name="1"
        prefix="1"
        title="Enter your email adress"
        color="warning"
        :done="step > 1"
        done-color="green-6"
        error-color="red-6"
        :error="emailError"
      >
        Для начала процесса восстановления доступа аккаунта введите email адрес, который вы указывали при регистрации. На него будет отправленом письмо с ключом подтверждения
        <q-input
          autofocus
          v-model="email"
          :error="emailError"
          :errorMessage="emailErrorMessage"
          @input="validateEmail($event, 'repair'), loading.email=true"
        />
      </q-step>

      <q-step
        :name="2"
        icon="fas fa-shield-alt"
        title="Enter confirmation code"
        color="warning"
        :done="step > 2"
        done-color="green-6"
        error-color="red-6"
        :error="repairKeyError"
      >
        Введите ключ подтверждения из письма, которое пришло на ваш электронный адрес
        <q-input
          autofocus
          maxlength="36"
          placeholder="Например, 133caea8-c3ad-490c-b70f-8eb0f4c29639"
          v-model="repairKey"
          :error="repairKeyError"
          :errorMessage="repairKeyErrorMessage"
          @input="validateRepairKey($event); loading.repair=true"
        />
      </q-step>

      <q-step
        :name="3"
        icon="fas fa-lock"
        title="Choose your new password"
        color="warning"
        :disable="step < 3"
      >
        Теперь можете указать ваш новый пароль.
        <q-input
          autofocus
          minlength="7"
          maxlength="30"
          v-model="password"
          hint="От 7 до 30 символов"
          counter
          :error="passwordError"
          :errorMessage="passwordErrorMessage"
          @input="validatePassword"
        />
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn
            @click="nextStep"
            :color="canNext ? 'green-6':'red-6'"
            :disabled="!canNext"
            :label="step === 3 ? 'Finish' : 'Далее'"
          />
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="$refs.stepper.previous()"
            label="Назад"
            class="q-ml-sm"
          />
          <q-btn
            v-if="step===1"
            @click="$refs.stepper.next()"
            color="green-6"
            class="float-right"
            label="Уже есть код?"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
</template>