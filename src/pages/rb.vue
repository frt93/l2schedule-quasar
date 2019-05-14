<template>
  <q-page>
    <rbList></rbList>
  </q-page>
</template>
<script>
import rbList from "../components/rbList";
export default {
  name: "rbPage",
  components: {
    rbList
  },
  preFetch({ store }) {
    return store.dispatch("fetch");
  }
};
</script>
