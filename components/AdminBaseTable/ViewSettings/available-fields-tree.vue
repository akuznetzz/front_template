<template>
  <v-treeview
    ref="treeView"
    class="scrolling-item"
    dense
    hoverable
    return-object
    open-all
    :items="treeNodesList"
    :value="ctrlNodesList"
    @input="$emit('input', $event)"
  >
    <template #prepend="{item, open}">
      <div v-if="!item.parentOnly">
        <v-tooltip top>
          <template #activator="{on}">
            <v-btn small v-on="on" @click="onClickShow(item)">
              <v-icon v-text="`mdi-${item.selected ? 'checkbox-marked' : 'checkbox-blank-outline'}`" />
            </v-btn>
          </template>
          Визуализируемое поле
        </v-tooltip>
        <v-tooltip top>
          <template #activator="{on}">
            <v-btn
              small
              v-on="on"
              :disabled="item.nodeKind === 'manual' || item.fieldType === 'field'"
              @click="onClickSort(item)"
            >
              <v-icon
                v-text="
                  `mdi-${
                    item.sortDirection === SortDirection.Ascending
                      ? 'sort-reverse-variant'
                      : item.sortDirection === SortDirection.Descending
                      ? 'sort-variant'
                      : 'border-none-variant'
                  }`
                "
              />
            </v-btn>
          </template>
          Сортировка по полю
        </v-tooltip>
      </div>
    </template>
    <template #label="{item, open}">
      <div>
        {{ item.title || item.name }}
      </div>
    </template>
    <template #append="{item, open}">
      <div v-if="!item.parentOnly && (item.title || item.name !== item.path_title)">
        {{ item.path_title }}
      </div>
    </template>
  </v-treeview>
</template>

<script lang="ts">
import {IEntitySpec} from '~/framework/dbd/dbd-spec';
import {ViewFieldNode, ViewFieldNodesList} from '~/components/AdminBaseTable/ViewSettings/view-settings-helper';
import {SortDirection} from '~/common/sorts';

export default defineComponent({
  name: 'AvailableFieldsTree',

  components: {},

  props: {
    tableSpec: {
      type: Object as PropType<IEntitySpec>,
    },
    treeNodesList: {
      type: Array,
      default: () => [],
    },
    ctrlNodesList: {
      type: Array,
      default: () => [],
    },
  },

  setup(_props, {emit}) {
    const refreshNodes: Ref<ViewFieldNodesList> = ref([]);

    function onClickShow(nodeItem: ViewFieldNode) {
      nodeItem.selected = !nodeItem.selected;
      emit('shownChanged', nodeItem);
    }

    function onClickSort(nodeItem: ViewFieldNode) {
      if (nodeItem.sortDirection === SortDirection.Ascending) {
        nodeItem.sortDirection = SortDirection.Descending;
      } else if (nodeItem.sortDirection === SortDirection.Descending) {
        nodeItem.sortDirection = undefined;
      } else {
        nodeItem.sortDirection = SortDirection.Ascending;
      }
      emit('sortedChanged', nodeItem);
    }

    function onClickFilter(nodeItem: ViewFieldNode) {
      if (nodeItem.filter) {
        nodeItem.filter = undefined;
      } else {
        nodeItem.filter = '!=';
      }
      emit('filteredChanged', nodeItem);
    }

    return {
      SortDirection,
      onClickFilter,
      onClickSort,
      onClickShow,
      refreshNodes,
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
