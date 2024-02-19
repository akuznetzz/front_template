<template>
  <div class="scrollable-items-holder">
    <v-list class="scrolling-item" dense>
      <v-list-item v-for="(item, i) in availableNodesList" :key="i">
        <v-list-item-content>
          <v-list-item-title @click="getFieldTitle(item)" v-text="getItemTitle(item)" />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn small icon>
            <v-icon @click="onClickRemoveAvailableField(item)"> mdi-table-column-remove </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <string-edit-dialog
      :header-str="'Наименование поля'"
      :show-dialog="showFieldTitleDialog"
      :str-value="fieldTitle"
      :on-close-dialog="onCloseDialog"
    />
  </div>
</template>

<script lang="ts">
import {ViewFieldNode, ViewFieldNodesList} from '../ViewSettings/view-settings-helper';
import {BaseFieldNodesList} from './base-fields-helper';
import StringEditDialog from '~/components/SmartTable/table-menu/string-edit-dialog.vue';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';

const DummyOnCloseDialog = () => {};

export default defineComponent({
  name: 'AvailableFieldsList',

  components: {
    StringEditDialog,
  },

  props: {
    nodesList: {
      type: Array as PropType<BaseFieldNodesList>,
      default: () => [],
    },
  },

  setup(props, {emit}) {
    const availableNodesList = ref<ViewFieldNodesList>();
    const showFieldTitleDialog = ref(false);
    const fieldTitle = ref();
    const onCloseDialog: Ref<(e: any) => void> = ref(DummyOnCloseDialog);

    function setAvailableNodesListValue(availableNodes?: ViewFieldNodesList) {
      availableNodesList.value = availableNodes ? [...availableNodes] : [];
    }

    setAvailableNodesListValue(props.nodesList);

    watch(
      () => props.nodesList,
      (nodesList) => {
        setAvailableNodesListValue(nodesList);
      },
    );

    async function getFieldTitle(item: ViewFieldNode) {
      fieldTitle.value = item.title;

      const result: any = await new Promise((resolve) => {
        showFieldTitleDialog.value = true;
        onCloseDialog.value = (e: any) => {
          showFieldTitleDialog.value = false;
          resolve(e);
        };
      });

      onCloseDialog.value = DummyOnCloseDialog;
      if (result && result.modalResult === ModalResult.Accepted && result.payload) {
        item.title = result.payload.strValue;
      }
    }

    function getItemTitle(item: ViewFieldNode) {
      return item.title ? `${item.title} <${item.path_title}>` : `${item.name} <${item.path_title}>`;
    }

    function onClickRemoveAvailableField(nodeItem: ViewFieldNode) {
      nodeItem.selected = false;
      emit('availableChanged', [nodeItem]);
    }

    return {
      availableNodesList,
      showFieldTitleDialog,
      fieldTitle,
      onCloseDialog,
      getFieldTitle,
      getItemTitle,
      onClickRemoveAvailableField,
    };
  },
});
</script>

<style scoped>
.scrollable-items-holder {
  width: 100%;
  height: 95%;
  overflow: hidden;
}

.scrolling-item {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
