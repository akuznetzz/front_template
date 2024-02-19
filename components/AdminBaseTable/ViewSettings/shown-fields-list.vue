<template>
  <v-list class="scrolling-item" dense>
    <draggable v-model="shownNodesList" @end="draggableEnd">
      <v-list-item v-for="(item, i) in shownNodesList" :key="i">
        <v-list-item-content>
          <v-list-item-title v-text="getItemTitle(item)" />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn small icon>
            <v-icon @click="onClickRemoveField(item)"> mdi-table-column-remove </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </draggable>
  </v-list>
</template>

<script lang="ts">
import {ViewFieldNode, ViewFieldNodesList} from '~/components/AdminBaseTable/ViewSettings/view-settings-helper';

export default defineComponent({
  name: 'ShownFieldsList',

  components: {},

  props: {
    nodesList: {
      type: Array as PropType<ViewFieldNodesList>,
      default: () => [],
    },
  },

  setup(props, {emit}) {
    const shownNodesList = ref<ViewFieldNodesList>();

    watch(
      () => props.nodesList,
      (nodesList) => {
        shownNodesList.value = nodesList ? [...nodesList] : [];
      },
    );

    function getItemTitle(item: ViewFieldNode) {
      return item.title ? `${item.title} <${item.path_title}>` : `${item.name} <${item.path_title}>`;
    }

    function onClickRemoveField(nodeItem: ViewFieldNode) {
      nodeItem.selected = false;
      emit('shownChanged', nodeItem);
    }

    function draggableEnd() {
      emit('shownPermutation', shownNodesList.value);
    }

    return {
      draggableEnd,
      onClickRemoveField,
      shownNodesList,
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
