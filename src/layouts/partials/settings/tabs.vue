<template>
  <q-page-sticky position="top-left" expand>
    <div class="fit column" style="max-width: 250px">
      <q-tabs
        class="bg-grey-1"
        align="justify"
        vertical
        :inline-label="screenWidth > 767 ?true :false"
        no-caps
      >
        <q-route-tab
          v-for="(tab,i) in routes"
          :key="i"
          :to="{name: tab.to}"
          replace
          :icon="tab.icon"
          :label="screenWidth > 480 ? $t(tab.label) : ''"
          :style="screenWidth > 767 ? 'justify-content:flex-start' : ''"
        >
          <q-badge v-if="tab.alert" color="red-6" floating>{{tab.alert}}</q-badge>
        </q-route-tab>
      </q-tabs>
    </div>
    <q-resize-observer @resize="onResize" />
  </q-page-sticky>
</template>

<script>
export default {
  props: ["screenWidth", "routes"],

  computed: {},

  methods: {
    onResize(sizes) {
      // console.log(sizes);
    }
  }
};
</script>
