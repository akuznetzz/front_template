<template>
  <v-list class="scrolling-item" dense>
    <v-list-item v-for="(item, i) in filteredNodesList" :key="i">
      <v-list-item-content>
        <v-list-item-title v-text="item.name" />
      </v-list-item-content>
      <v-list-item-action>
        <v-btn icon>
          <v-icon @click="onClickRemoveFilter(item)"> mdi-filter-remove-outline</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import {ViewFieldNode} from '~/components/AdminBaseTable/ViewSettings/view-settings-helper';

export default defineComponent({
  name: 'FilteredFieldsList',

  components: {},

  props: {
    filteredNodesList: {
      type: Array,
      default: () => [],
    },
  },

  setup(_props, {emit}) {
    function onClickRemoveFilter(nodeItem: ViewFieldNode) {
      nodeItem.filter = undefined;
      emit('filteredChanged', nodeItem);
    }

    return {
      onClickRemoveFilter,
    };
  },
});
</script>

<style scoped>
.scrolling-item {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
