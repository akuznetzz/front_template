<template>
  <vue-json-viewer :value="jsonData" :expand-depth="expandDepth" />
</template>

<script>
import VueJsonViewer from 'vue-json-viewer';

export default {
  name: 'json-viewer',
  components: {
    VueJsonViewer,
  },
  props: {
    dataString: {default: ''},
    expandDepth: {
      type: Number,
      default: 2,
    },
  },
  computed: {
    jsonData() {
      try {
        return JSON.parse(this.dataString);
      } catch (e) {
        return {};
      }
    },
  },
};
</script>

<style scoped />
