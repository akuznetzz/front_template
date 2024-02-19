<template>
  <div>
    <v-dialog
      v-model="showDialog"
      persistent
      scrollable
      max-width="95%"
      @keydown.enter.prevent="onCloseDialog(getDialogResult(true))"
      @keydown.esc.prevent="onCloseDialog(getDialogResult(false))"
    >
      <v-card>
        <v-toolbar dark color="primary">
          {{ dialogTitle }}
        </v-toolbar>

        <v-card-text>
          <v-row style="height: 744px">
            <v-col class="pt-6 pl-0 pr-2" cols="5" style="height: 100%">
              <b>Доступные поля таблицы</b>
              <v-card class="scrollable-items-holder">
                <template v-if="!availableNodesList || availableNodesList.length === 0">
                  <b>Выберите поля в дереве.</b>
                </template>
                <template v-else>
                  <available-fields-list :nodes-list="availableNodesList" @availableChanged="onAvailableChanged" />
                </template>
              </v-card>
            </v-col>
            <v-divider vertical />
            <v-col class="pt-6 pl-2 pr-0" cols="7" style="height: 100%">
              <b>Дерево полей таблицы</b>
              <v-card class="scrollable-items-holder">
                <table-fields-tree
                  v-if="treeNodesList"
                  :tree-nodes-list="treeNodesList"
                  :open-nodes="openNodesList"
                  :ctrl-nodes-list="ctrlNodesList"
                  :get-children-nodes-list="getChildrenNodesList"
                  @availableChanged="onAvailableChanged"
                />
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn text @click="clickAddManualNode"><b>Добавить вручную</b></v-btn>
          <v-btn text @click="clearSelect">Очистить доступные</v-btn>
          <v-spacer />
          <v-btn color="green darken-1" text @click="onCloseDialog(getDialogResult(false))"><b>Закрыть</b></v-btn>
          <v-btn
            color="green darken-1"
            text
            @keydown.enter="onCloseDialog(getDialogResult(true))"
            @click="onCloseDialog(getDialogResult(true))"
          >
            <b>Применить</b>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <manual-field-dialog :show-dialog="showManualFieldDialog" :on-close-dialog="onCloseManualFielDialog" />
  </div>
</template>

<script lang="ts">
import AvailableFieldsList from '~/components/AdminBaseTable/BaseViewFields/available-fields-list.vue';
import TableFieldsTree from '~/components/AdminBaseTable/BaseViewFields/table-fields-tree.vue';
import {
  BaseFieldNode,
  BaseFieldNodesList,
  BaseViewFieldsHelper,
} from '~/components/AdminBaseTable/BaseViewFields/base-fields-helper';
import {BaseViewFields} from '~/components/AdminBaseTable/base-table-view';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import ManualFieldDialog from '~/components/AdminBaseTable/BaseViewFields/manual-field-dialog.vue';

const DummyOnCloseDialog = (_e: any) => {};

export default defineComponent({
  name: 'BaseFieldsDialog',
  components: {
    AvailableFieldsList,
    TableFieldsTree,
    ManualFieldDialog,
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    onCloseDialog: {
      type: Function,
      default: () => {},
    },
    tableName: {
      type: String,
      required: true,
    },
    availableFields: {
      type: Array as PropType<BaseViewFields>,
      default: () => [],
    },
  },
  setup(props) {
    const root = getCurrentInstance().proxy;
    const domainModel = (root as any).$domainModel;
    const dialogTitle = ref<String>();
    const baseViewFieldsHelper = new BaseViewFieldsHelper(domainModel, props.tableName, root);
    const {treeNodesList, availableNodesList, openNodesList, ctrlNodesList} = baseViewFieldsHelper.prepare();
    const showManualFieldDialog = ref(false);
    const onCloseManualFielDialog = ref(DummyOnCloseDialog);

    watch(
      () => props.showDialog,
      async (showDialog) => {
        if (showDialog) {
          await baseViewFieldsHelper.tuneViewSettingsHelper(props.availableFields);
          dialogTitle.value = `Базовый набор полей таблицы ${props.tableName}`;
        } else {
          dialogTitle.value = '';
          baseViewFieldsHelper.reset();
        }
      },
    );

    function getDialogResult(accept: boolean) {
      return {
        modalResult: accept ? ModalResult.Accepted : ModalResult.Denied,
        payload: {availableFields: baseViewFieldsHelper.makeAvailableFields()},
      };
    }

    function onAvailableChanged(changedNodesList: BaseFieldNodesList) {
      baseViewFieldsHelper.availableChanged(changedNodesList);
    }

    async function getChildrenNodesList(nodeItem: BaseFieldNode) {
      return await baseViewFieldsHelper.childrenNodesList(nodeItem);
    }

    async function clickAddManualNode() {
      const result: any = await new Promise((resolve) => {
        showManualFieldDialog.value = true;
        onCloseManualFielDialog.value = (e: any) => {
          showManualFieldDialog.value = false;
          resolve(e);
        };
      });
      onCloseManualFielDialog.value = DummyOnCloseDialog;

      if (result && result.modalResult === ModalResult.Accepted && result.payload) {
        baseViewFieldsHelper.addManualFieldNode(result.payload.nameValue, result.payload.titleValue);
      }
    }

    function clearSelect() {
      baseViewFieldsHelper.clearSelectedNodesList();
    }

    return {
      clickAddManualNode,
      clearSelect,
      getChildrenNodesList,
      onAvailableChanged,
      dialogTitle,
      getDialogResult,
      treeNodesList,
      availableNodesList,
      openNodesList,
      ctrlNodesList,
      showManualFieldDialog,
      onCloseManualFielDialog,
    };
  },
});
</script>

<style scoped>
.scrollable-items-holder {
  width: 100%;
  height: 99%;
  overflow: hidden;
}
</style>
