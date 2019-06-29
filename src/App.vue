<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>

<script>
import { Cookies } from "quasar";
import cookies from "js-cookie";
import date from "handlers/date";
import userAPI from "handlers/user/api";
export default {
  name: "App",
  async preFetch({ store, ssrContext }) {
    const cookies = Cookies.parseSSR(ssrContext);
    const token = cookies.get("auth");

    if (cookies.has("auth")) {
      await store.dispatch("user/authorize", token);
    } else {
      store.commit("user/reset");
    }
  },

  async beforeCreate() {
    if (process.env.CLIENT) {
      let lang = this.$store.state.user.language;
      this.$i18n.locale = lang;
      date.setDefaultLocale(lang);
      userAPI.setLanguageHeader(lang);
      await import(`quasar/lang/${lang}`).then(lang => {
        this.$q.lang.set(lang.default);
      });
      cookies.set("lang", lang, { expires: 3650 });

      this.$store.dispatch("user/getTimezone");
    }
  }
};
</script>

<style>
</style>
