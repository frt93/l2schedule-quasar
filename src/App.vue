<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "App",
  async preFetch({ store, ssrContext }) {
    await store.dispatch("auth/authorize", ssrContext);
  }
};
</script>

<style>
</style>
