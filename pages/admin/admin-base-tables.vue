<template>
  <workspace ref="workspace">
    <template #rootContext>
      <div class="pa-3" style="width: 100%; height: 100%">
        <smart-table
          v-if="tableName"
          style="width: 100%; height: 100%"
          context-id="adminBaseTable"
          :api-model="tableName"
          :shown-column-names="displayedViewFields"
          :includes="viewIncludes"
          :conf="{
            sort: false,
            adding_button: false,
            deleting_button: false,
            export_tables_button: false,
            aggregation_button: false,
          }"
        >
          <template slot="servicePanel">
            <service-panel-button
              caption="Выбрать таблицу"
              icon-name="mdi-database-search-outline"
              class="pl-2"
              tooltip="Выбрать таблицу базы данных"
              @click="choiceTableName"
            />
            <service-panel-button
              :caption="getCaption('Дерево полей')"
              icon-name="mdi-file-tree-outline"
              class="pl-2"
              :tooltip="getTooltip('Базовое дерево полей')"
              @click="editBaseFieldsTree"
            />
            <service-panel-button
              :caption="getCaption('Представление')"
              icon-name="mdi-table-cog"
              class="pl-2"
              :tooltip="getTooltip('Настройка представления')"
              @click="editViewSettings"
            />
          </template>
        </smart-table>
        <choice-table-dialog :show-dialog="showChoiceTableDialog" :on-close-dialog="onCloseDialog" />
        <base-fields-dialog
          v-if="tableName"
          :show-dialog="showBaseFieldsTreeDialog"
          :on-close-dialog="onCloseDialog"
          :table-name="tableName"
          :available-fields="availableViewFields"
          :title-suffix="dialogTitleSuffix"
        />
        <view-settings-dialog
          v-if="tableName"
          :show-dialog="showViewSettingsDialog"
          :on-close-dialog="onCloseDialog"
          :table-name="tableName"
          :context="userContext"
          :title-suffix="dialogTitleSuffix"
        />
      </div>
    </template>
  </workspace>
</template>

<script lang="ts">
import ChoiceTableDialog from '~/components/AdminBaseTable/choice-table-dialog.vue';
import ServicePanelButton from '~/components/SmartTable/ServicePanelButton.vue';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import Workspace from '~/framework/workspace-components/workspace.vue';
import SmartTable from '~/components/SmartTable/SmartTable.vue';
import BaseFieldsDialog from '~/components/AdminBaseTable/BaseViewFields/base-fields-dialog.vue';
import {
  baseTableHelper,
  saveBaseViewSettings,
  saveTableViewSettings,
  updateLocaleCacheBaseViewSettings,
} from '~/components/AdminBaseTable/base-table-view';
import ViewSettingsDialog from '~/components/AdminBaseTable/ViewSettings/view-settings-dialog.vue';

const DummyOnCloseDialog = (_e: any) => {};

export default defineComponent({
  components: {
    ViewSettingsDialog,
    BaseFieldsDialog,
    Workspace,
    SmartTable,
    ServicePanelButton,
    ChoiceTableDialog,
  },

  setup(_props) {
    const root = getCurrentInstance().proxy;
    const domainModel = (root as any).$domainModel;
    const onCloseDialog = ref(DummyOnCloseDialog);
    const showChoiceTableDialog = ref(false);
    const showBaseFieldsTreeDialog = ref(false);
    const showViewSettingsDialog = ref(false);

    const tableName: Ref<string | undefined> = ref();
    const userContext: Ref<string | undefined> = ref('');
    const dialogTitleSuffix: Ref<string | undefined> = ref('');
    const tableTitle: Ref<string | undefined> = ref();
    const {availableViewFields, displayedViewFields, viewIncludes, getBaseTableCnf} = baseTableHelper(domainModel);

    onMounted(async () => {
      await choiceTableName();
    });

    async function setTableName(newTableName: string, context: string = '') {
      tableName.value = undefined;
      dialogTitleSuffix.value = '';
      tableTitle.value = undefined;
      userContext.value = '';
      await root.$nextTick();
      await getBaseTableCnf(newTableName, context);
      tableName.value = newTableName;
      userContext.value = context;
      dialogTitleSuffix.value = userContext.value ? '(для правообладателя)' : '(общий кабинет)';
      tableTitle.value = (await domainModel.getEntitySpec(newTableName)).verboseName || undefined;
    }

    async function choiceTableName() {
      const result: any = await new Promise((resolve) => {
        showChoiceTableDialog.value = true;
        onCloseDialog.value = (e: any) => {
          showChoiceTableDialog.value = false;
          resolve(e);
        };
      });
      onCloseDialog.value = DummyOnCloseDialog;
      if (result && result.modalResult === ModalResult.Accepted && result.payload) {
        await setTableName(result.payload.tableName, result.payload.context);
      } else if (!tableName.value) {
        await setTableName('dispatchers');
      }
    }

    async function editBaseFieldsTree() {
      await getBaseTableCnf(tableName.value!, userContext.value);

      const result: any = await new Promise((resolve) => {
        showBaseFieldsTreeDialog.value = true;
        onCloseDialog.value = (e: any) => {
          showBaseFieldsTreeDialog.value = false;
          resolve(e);
        };
      });
      onCloseDialog.value = DummyOnCloseDialog;

      if (result && result.modalResult === ModalResult.Accepted && result.payload) {
        const baseViewSettings = {available_fields: result.payload.availableFields};
        await saveBaseViewSettings(domainModel, tableName.value!, baseViewSettings, userContext.value);
        updateLocaleCacheBaseViewSettings(root.$auth.user.email, tableName.value!, baseViewSettings);
        await setTableName(tableName.value!, userContext.value);
      }
    }

    async function editViewSettings() {
      const result: any = await new Promise((resolve) => {
        showViewSettingsDialog.value = true;
        onCloseDialog.value = (e: any) => {
          showViewSettingsDialog.value = false;
          resolve(e);
        };
      });
      onCloseDialog.value = DummyOnCloseDialog;

      if (result && result.modalResult === ModalResult.Accepted && result.payload?.tableViewSettings) {
        await saveTableViewSettings(domainModel, tableName.value!, result.payload!.tableViewSettings, userContext.value);
      }
    }

    function getCaption(prefix: string) {
      return `${prefix} ${tableTitle.value || tableName.value}`;
    }

    function getTooltip(prefix: string) {
      return `${prefix} (${userContext.value ? 'для правообладателя' : 'общий кабинет'})`;
    }

    return {
      availableViewFields,
      displayedViewFields,
      viewIncludes,
      tableName,
      getCaption,
      getTooltip,
      choiceTableName,
      editViewSettings,
      editBaseFieldsTree,
      showChoiceTableDialog,
      showBaseFieldsTreeDialog,
      showViewSettingsDialog,
      userContext,
      dialogTitleSuffix,
      onCloseDialog,
    };
  },
});
</script>

<style scoped></style>
