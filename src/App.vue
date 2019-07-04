<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { Cookies } from "quasar";

import cookies from "js-cookie";
import userAPI from "handlers/user/api";
import dateAPI from "handlers/date";
import langAPI from "handlers/lang";
export default {
  name: "App",
  async preFetch({ store, ssrContext }) {
    const cookies = Cookies.parseSSR(ssrContext);

    if (cookies.has("auth")) {
      const token = cookies.get("auth");
      await store.dispatch("user/authorize", token);
    } else {
      store.commit("user/reset");
    }
  },

  async beforeCreate() {
    if (process.env.CLIENT) {
      this.$store.dispatch("user/internationalization");
      this.$store.dispatch("user/setTimezone");
    }
  }
};
</script>

<style>
</style>
