<template>
  <q-layout view="lHh lpR fFf">
    <mainheader></mainheader>
    <q-page-container>
      <q-page>
        <div class="float-left q-mr-xl" style="min-width: 250px; height: 100vh">
          <q-list bordered separator>
            <q-item :to="{name:'settings/account'}" replace v-ripple>
              <q-item-section>Учетная запись</q-item-section>
            </q-item>

            <q-item :to="{name:'settings/password'}" replace v-ripple>
              <q-item-section>
                <q-item-label>Пароль</q-item-label>
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

        <router-view :userInstance="user"></router-view>
      </q-page>
    </q-page-container>
  </q-layout>
</template>


<script>
import mainheader from "component/ui/header/main";
import { mapState } from "vuex";
export default {
  name: "settingsLayout",
  components: { mainheader },
  data() {
    return {};
  },

  computed: {
    ...mapState({
      user: state => state.user.instance
    })
  },

  render(h) {
    return h("q-layout", { props: { view: "lHh lpR fFf" } }, [
      h(mainheader),
      h("q-page-container", [h("router-view")])
    ]);
  }
};
</script>

<style lang="stylus">
.inputs .q-field {
  margin-bottom: $spaces.md.y;
}

.q-btn.submit .q-spinner {
  margin-left: $spaces.sm.x;
}
</style>