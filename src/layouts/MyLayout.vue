<template>
  <q-layout view="lHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-tabs>
          <q-route-tab to="/" exact ripple>Главная</q-route-tab>
          <q-route-tab to="/rb" exact ripple>Рейдовые боссы</q-route-tab>
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>