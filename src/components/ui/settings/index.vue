<template>
  <div class="q-pa-md">
    <div class="float-left q-mr-xl" style="min-width: 250px">
      <q-list bordered separator>
        <q-item clickable v-ripple>
          <q-item-section>Single line item</q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Item with caption</q-item-label>
            <q-item-label caption>Caption</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label overline>OVERLINE</q-item-label>
            <q-item-label>Item with caption</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="q-ml-xl">
      <q-input v-model="user.username" label="Никнейм" :hint="usernameHint"/>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      usernameHint: `Имя под которым вас видят остальные пользователи. Можно использовать для авторизации.\n После изменения вам придется перезайти`
    };
  },
  computed: {
    ...mapState({
      user: state => state.user.user
    })
  }
};
</script>
