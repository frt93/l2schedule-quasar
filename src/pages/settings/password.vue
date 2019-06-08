<template>
  <div class="q-ml-xl inputs">
    <q-input v-model="currentPassword" label="Текущий пароль" hint="Ваш текущий пароль"/>

    <q-input v-model="newPassword" label="Новый пароль" hint="Ваш новый пароль"/>
  </div>
</template>

<script>
export default {
  name: "accountPage",
  props: ["userInstance"],

  data() {
    return {
      currentPassword: "",
      newPassword: ""
    };
  },

  meta() {
    return {
      title: "Пароль - Настройки",
      titleTemplate: title => `${title} - L2Schedule`
    };
  }
};
</script>
