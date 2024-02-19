<template>
  <v-treeview
    ref="treeView"
    class="scrolling-item"
    dense
    hoverable
    return-object
    :items="treeNodesList"
    :value="ctrlNodesList"
    :open.sync="openNodesList"
    :load-children="loadChildren"
  >
    <template #prepend="{item, open}">
      <v-icon
        @click="onClickSelect(item)"
        v-text="`mdi-${item.selected ? 'checkbox-marked' : 'checkbox-blank-outline'}`"
      />
    </template>
    <template #label="{item, open}">
      <div>
        {{ calcNodeLabel(item) }}
        <v-tooltip v-if="open" top>
          <template #activator="{on}">
            <v-btn small v-on="on" @click="onClickSelectChildren(item)">
              <v-icon>mdi-checkbox-multiple-blank-outline</v-icon>
            </v-btn>
          </template>
          Отметить все дочерние
        </v-tooltip>
      </div>
    </template>
    <template #append="{item, open}">
      <div>
        {{ item.path }}
      </div>
    </template>
  </v-treeview>
</template>

<script lang="ts">
import {BaseFieldNode, BaseFieldNodesList} from '~/components/AdminBaseTable/BaseViewFields/base-fields-helper';

export default defineComponent({
  name: 'TableFieldsTree',

  components: {},

  props: {
    treeNodesList: {
      type: Array as PropType<BaseFieldNodesList>,
      default: () => [],
    },
    openNodes: {
      type: Array as PropType<BaseFieldNodesList>,
      default: () => [],
    },
    ctrlNodesList: {
      type: Array as PropType<BaseFieldNodesList>,
      default: () => [],
    },
    getChildrenNodesList: {
      type: Function as PropType<(item: BaseFieldNode) => BaseFieldNodesList>,
      required: true,
    },
  },

  setup(props, {emit}) {
    const openNodesList = ref<BaseFieldNodesList>();

    function setOpenNodesListValue(openNodes?: BaseFieldNodesList) {
      openNodesList.value = openNodes ? [...openNodes] : [];
    }

    setOpenNodesListValue(props.openNodes);

    watch(
      () => props.openNodes,
      (openNodes) => {
        setOpenNodesListValue(openNodes);
      },
    );

    async function loadChildren(item: BaseFieldNode) {
      if (item && item.related_to && item.children !== undefined) {
        item.children = await props.getChildrenNodesList(item);
      }
    }

    function onClickSelect(nodeItem: BaseFieldNode) {
      nodeItem.selected = !nodeItem.selected;
      emit('availableChanged', [nodeItem]);
    }

    function onClickSelectChildren(nodeItem: BaseFieldNode) {
      if (!nodeItem.children) {
        return;
      }
      const selectedChildren = nodeItem.children
        .filter((childNode) => childNode.fieldName !== 'id' && !childNode.selected)
        .map((childNode) => {
          childNode.selected = true;
          return childNode;
        });
      emit('availableChanged', selectedChildren);
    }

    function calcNodeLabel(node: any) {
      return `${node.name} /${node.fieldType}/`;
    }

    return {
      openNodesList,
      calcNodeLabel,
      onClickSelectChildren,
      onClickSelect,
      loadChildren,
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
