<template>
  <div class="inputs">
    <q-input
      label="Никнейм"
      v-model="fields.username"
      hint="Имя под которым вас видят остальные пользователи. Можно использовать для авторизации"
      :error="usernameError"
      :errorMessage="usernameErrorMessage"
      @input="validateUsername"
    />

    <q-input
      v-model="fields.email"
      label="Email"
      hint="Адрес электронной почты"
      :error="emailError"
      :errorMessage="emailErrorMessage"
      @input="validateEmail"
    />
    <q-input
      v-if="needPasswordConfirm"
      maxlength="30"
      counter
      v-model="password"
      label="Пароль"
      :hint="hints.password"
      :error="passwordError"
      :errorMessage="passwordErrorMessage"
      @input="validatePassword"
    />
    <q-select
      label="Язык"
      v-model="language"
      :options="languageOptions"
      options-selected-class="text-green"
      map-options
    />
    <div class="q-my-xl" v-if="showSubmitButton">
      <q-btn
        class="float-right submit"
        label="Сохранить"
        type="submit"
        :loading="loading"
        :color="canSubmit ? 'green-6' : 'red-6'"
        :disabled="!canSubmit"
        @click="submit"
      >
        <template v-slot:loading>
          {{'Loading '}}
          <q-spinner-dots/>
        </template>
      </q-btn>
    </div>
  </div>
</template>

<script>
import auth from "mixin/auth";
export default {
  name: "accountPage",
  mixins: [auth],
  props: {
    userInstance: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      fields: {
        username: this.userInstance.username,
        email: this.userInstance.email
      },
      language: "ru",
      languageOptions: [
        { label: "Русский", value: "ru" },
        { label: "Украинский", value: "ua" },
        { label: "Английский", value: "en" }
      ],
      hints: {
        password:
          "При изменении никнейма или email адреса необходимо ввести ваш текущий пароль от аккаунта для подтверждения процедуры"
      },
      passwordErrorMessage:
        "При изменении никнейма или email адреса необходимо ввести ваш текущий пароль от аккаунта для подтверждения процедуры",
      loading: false
    };
  },

  computed: {
    /**
     * Проверяем отсутствие ошибок и разблокируем кнопку отправки
     */
    canSubmit() {
      return this.usernameError ||
        this.emailError ||
        this.passwordError ||
        this.password.length < 7 ||
        this.password.length > 30
        ? false
        : true;
    },

    /**
     * Если было изменено хоть одно поле с данными - можно показать кнопку сохранения
     */
    showSubmitButton() {
      let answer;
      for (let field in this.fields) {
        if (this.fields[field] !== this.userInstance[field]) {
          answer = true;
          break;
        } else {
          answer = false;
        }
      }

      return answer;
    },

    /**
     * Если пользователь внес изменения в email адрес или никнейм - запрашиваем у него пароль для подтверждения
     */
    needPasswordConfirm() {
      if (
        this.fields.username !== this.userInstance.username ||
        this.fields.email !== this.userInstance.email
      ) {
        return true;
      } else {
        this.password = "";
        return false;
      }
    }
  },

  methods: {
    submit() {
      this.loading = true;

      let data = {
        payload: this.fields,
        id: this.userInstance.id
      };
      if (this.needPasswordConfirm) {
        data = { ...data, password: this.password };
      }

      this.$axios
        .post("/users/settings/account", data)
        .then(res => {
          this.$store.commit("user/setUser", res.data);
          this.successNotify("Учетные данные обновлены");
        })
        .catch(e => {
          this.handleErrors(e);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },

  meta() {
    return {
      title: "Учетные данные - Настройки",
      titleTemplate: title => `${title} - L2Schedule`
    };
  }
};
</script>