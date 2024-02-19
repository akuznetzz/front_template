<template>
  <smart-table
    ref="relatedTable"
    :all-columns="tableData.columns"
    :api-model="tableData.apiModel"
    :conf="{
      adding_button: false,
      deleting_button: false,
      export_tables_button: false,
      column: false,
      filter: false,
      sort: false,
      selections: !readonly,
      aggregation_button: false,
    }"
    :external-filters="filter"
    :includes="tableData.includes"
    :table-name="tableData.tableName"
    style="width: 100%"
  >
    <template v-slot:servicePanel>
      <service-panel-button
        v-if="!readonly"
        :disabled="!selected.length"
        class="ml-2"
        color="secondary"
        icon-name="mdi-delete"
        @click="removeRecord()"
      />
      <service-panel-button
        v-if="!readonly"
        class="ml-2 mr-2"
        color="primary"
        icon-name="mdi-plus-box-multiple "
        @click="addRecord()"
      />
      <v-menu offset-y v-if="showLastSelected">
        <template v-slot:activator="{on, attrs}">
          <v-btn small color="primary" :disabled="lastUsedListValues.length === 0" v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical-circle-outline</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, index) in lastUsedListValues" :key="index" @click="assignValue(item.id)">
            <v-list-item-title>{{ item.description }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </smart-table>
</template>

<script lang="ts">
import SmartTable from '~/components/SmartTable/SmartTable.vue';
import ServicePanelButton from '~/components/SmartTable/ServicePanelButton.vue';
import {buildInFilter, Filter} from '~/common/filters';
import {fieldValueFromNumber} from '~/common/FieldValue';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import {executeComponent} from '~/framework/execute-component/execute-component';
import {MAX_OBJECT_CHOICE_ITEM_TO_SAVE} from '~/common/constants';
import {getModelsByPrimaryKeyValues} from '~/common/drest-request';
import {getSemanticFields} from '~/framework/edit-frame/input-controls/object-choice/get-semantic-fields';

export default defineComponent({
  components: {
    SmartTable,
    ServicePanelButton,
  },
  props: {
    primaryKeyValue: {
      type: Number,
    },
    tableData: {
      required: true,
      type: Object,
    },
    tableList: {
      required: true,
      type: Array,
    },
    changeFieldValue: {
      type: <any>Function,
    },
    field: {
      type: String,
    },
    externalFilters: {
      type: Object,
    },
    extraParams: {
      type: Object,
    },
    tableDataSelect: {
      type: Object,
    },
    choiceCardStyle: {
      type: String,
    },
    showLastSelected: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const relatedTable: any = ref(null);
    const tableList: any = ref(null);

    const root = getCurrentInstance().proxy;
    const lastUsedListIds = ref([]);
    const lastUsedListValues = ref([]);
    const localStoragePath = ['RelatedModelAdditional', props.tableData.apiModel, props.field, root.$auth.user.id].join(
      '/',
    );
    const semanticFields = ref([]);

    onMounted(async () => {
      tableList.value = JSON.parse(JSON.stringify(props.tableList));
      semanticFields.value = await getSemanticFields(
        await (root as any).$domainModel.getEntitySpec(props.tableData.apiModel),
      );
      loadFromLocalStorage();
    });

    const filter = computed(() => {
      let filter: Filter;
      if (props.tableList && props.tableList.length > 0) {
        filter = buildInFilter(
          'id',
          props.tableList.map((value: any) => fieldValueFromNumber(Number(value))),
        );
      } else {
        filter = buildInFilter('id', [fieldValueFromNumber(0)]);
      }
      return {
        externalTableFilters: [filter],
      };
    });

    const selected = computed(() => {
      return Array.from(relatedTable.value?.selectedRows?.values() || []);
    });

    function removeRecord() {
      const selectedRows: number[] = Array.from(relatedTable.value?.selectedRows?.values() || []);
      selectedRows.forEach((s) => {
        const index = tableList.value.indexOf(s);
        tableList.value.splice(index, 1);
      });
      props.changeFieldValue(props.field, tableList.value);
    }

    async function addRecord() {
      const executeProps = {
        apiModel: props.tableData.apiModel,
        selectedRows: new Set(tableList.value),
        externalFilters: props.externalFilters,
        extraParams: props.extraParams,
        allColumns: props.tableDataSelect?.columns,
        choiceCardStyle: props.choiceCardStyle,
      };

      const result = await executeComponent('multi-choice', executeProps);
      if (result.modalResult === ModalResult.Accepted && result.payload) {
        saveToLocalStorage(result.payload.filter((p: number[]) => !tableList.value.includes(p)));
        tableList.value = Array.from(result.payload);
      }
      props.changeFieldValue(props.field, tableList.value);
    }

    async function loadFromLocalStorage() {
      if (!props.showLastSelected || !localStorage.getItem(localStoragePath)) {
        return;
      }
      lastUsedListIds.value = JSON.parse(localStorage.getItem(localStoragePath) || '[]');
      const result = await getModelsByPrimaryKeyValues(
        (root as any).$domainModel,
        props.tableData.apiModel,
        lastUsedListIds.value,
      );
      lastUsedListValues.value = [];
      lastUsedListIds.value.forEach((id: any) => {
        if (result.findIndex((r) => r.id === id) !== -1) {
          const description: any[] = [];
          semanticFields.value.forEach((sf: string | number) => {
            description.push(result.find((r) => r.id === id)?.[sf]);
          });
          lastUsedListValues.value.push({id, description: description.join(' ')});
        }
      });
    }

    function saveToLocalStorage(list) {
      if (!props.showLastSelected || !list.size) {
        return;
      }
      lastUsedListIds.value.unshift(...list);
      lastUsedListIds.value = Array.from(new Set(lastUsedListIds.value));
      if (lastUsedListIds.value.length > MAX_OBJECT_CHOICE_ITEM_TO_SAVE) {
        lastUsedListIds.value.length = MAX_OBJECT_CHOICE_ITEM_TO_SAVE;
      }
      localStorage.setItem(localStoragePath, JSON.stringify(lastUsedListIds.value));
      loadFromLocalStorage();
    }

    function assignValue(id: number) {
      saveToLocalStorage(new Set([id]));
      tableList.value.push(id);
      props.changeFieldValue(props.field, tableList.value);
    }

    return {
      relatedTable,
      filter,
      selected,
      removeRecord,
      addRecord,
      lastUsedListValues,
      assignValue,
    };
  },
});
</script>
