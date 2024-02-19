<template>
  <v-list class="scrolling-item" dense>
    <draggable v-model="sortedNodesList" @end="draggableEnd">
      <v-list-item v-for="(item, i) in sortedNodesList" :key="i">
        <v-list-item-action>
          <v-btn small icon>
            <v-icon @click="onClickSort(item)">
              {{ item.sortDirection === SortDirection.Ascending ? 'mdi-sort-reverse-variant' : 'mdi-sort-variant' }}
            </v-icon>
          </v-btn>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title v-text="getItemTitle(item)" />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn small icon>
            <v-icon @click="onClickRemoveSort(item)"> mdi-sort-variant-remove </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </draggable>
  </v-list>
</template>

<script lang="ts">
import {SortDirection} from '~/common/sorts';
import {ViewFieldNode, ViewFieldNodesList} from '~/components/AdminBaseTable/ViewSettings/view-settings-helper';

export default defineComponent({
  name: 'SortedFieldsList',

  components: {},

  props: {
    nodesList: {
      type: Array as PropType<ViewFieldNodesList>,
      default: () => [],
    },
  },

  setup(props, {emit}) {
    const sortedNodesList = ref<ViewFieldNodesList>();

    watch(
      () => props.nodesList,
      (nodesList) => {
        sortedNodesList.value = nodesList ? [...nodesList] : [];
      },
    );

    function getItemTitle(item: ViewFieldNode) {
      return item.title ? `${item.title} <${item.path_title}>` : `${item.name} <${item.path_title}>`;
    }

    function onClickSort(nodeItem: ViewFieldNode) {
      nodeItem.sortDirection =
        nodeItem.sortDirection === SortDirection.Ascending ? SortDirection.Descending : SortDirection.Ascending;
      emit('sortedChanged', nodeItem);
    }

    function onClickRemoveSort(nodeItem: ViewFieldNode) {
      nodeItem.sortDirection = undefined;
      emit('sortedChanged', nodeItem);
    }

    function draggableEnd() {
      emit('sortedPermutation', sortedNodesList.value);
    }

    return {
      draggableEnd,
      onClickRemoveSort,
      onClickSort,
      sortedNodesList,
      SortDirection,
      getItemTitle,
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
