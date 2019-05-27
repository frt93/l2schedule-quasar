<template>
  <q-layout view="lHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-tabs>
          <q-route-tab to="/" exact ripple>Главная</q-route-tab>
          <q-route-tab to="/rb" exact ripple>Рейдовые боссы</q-route-tab>
          <q-route-tab to="/auth/signup" exact ripple>Регистрация</q-route-tab>
          <q-route-tab v-if="user" to exact ripple>{{user.username}}</q-route-tab>
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapGetters({ user: "user/getUser" })
  }
};
</script>