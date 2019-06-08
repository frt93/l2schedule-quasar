<template>
  <div>
    forum
    {{ $store.state.lang.lang.loginHint }}
  </div>
</template>

<script>
export default {
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: "Форум",
      titleTemplate: title => `${title} - L2Schedule`
    };
  }
};
</script>
