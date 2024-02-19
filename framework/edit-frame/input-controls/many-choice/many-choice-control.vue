<template>
  <v-autocomplete
    ref="fieldFrame"
    :clearable="!field.readOnly"
    :items="items"
    :label="label"
    :readonly="field.readOnly"
    :rules="rules"
    :search-input.sync="searchInput"
    :value="getValue"
    multiple
    small-chips
    deletable-chips
    hide-no-data
    hide-selected
    item-text="description"
    item-value="id"
    validate-on-blur
    @change="onChange"
  >
    <template #append-outer>
      <v-icon v-if="!field.readOnly" @click="openTable"> mdi-dots-horizontal-circle-outline </v-icon>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import {fieldValueFromArray} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {sendSearchDBObjects} from '~/framework/edit-frame/input-controls/object-choice/search-dbobjects';
import {assertIsDefined} from '~/common/assertions';
import {DBObject} from '~/framework/edit-frame/input-controls/object-choice/dbobject';
import {getDBObjectDescription} from '~/framework/edit-frame/input-controls/object-choice/get-dbobject-description';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';
import {executeComponent} from '~/framework/execute-component/execute-component';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';

const SEARCH_DELAY = 1000;

export default defineComponent({
  name: 'ManyChoiceControl',

  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },

  setup(props) {
    const root = getCurrentInstance().proxy;
    const domainModel = (root as any).$domainModel;
    const workspaceManager = (root as any).$workspaceManager;
    let modelSpec: IEntitySpec | undefined;
    const fieldFrame = ref<any>(null);

    const items = ref<DBObject[]>([]);
    const searchInput = ref('');
    let timer: number;
    const rules = useRequiredRule(props.field.spec!);

    function onChange(value: Array<any> | undefined) {
      props.field.value = value ? fieldValueFromArray(value) : undefined;
    }

    function searchObjects(searchString: string) {
      clearTimeout(timer);
      timer = window.setTimeout(async () => {
        items.value = [
          ...new Set([
            ...items.value,
            ...(await sendSearchDBObjects(
              modelSpec!,
              searchString,
              props.field?.extra?.externalFilters,
              props.field?.extra?.extraParams,
            )),
          ]),
        ];
      }, SEARCH_DELAY);
    }

    async function selectedItem(primaryKey: number) {
      const selectedDescription = await getDBObjectDescription(modelSpec!, primaryKey);
      return {id: primaryKey, description: selectedDescription};
    }

    onMounted(async () => {
      assertIsDefined(props.field.spec!.related_to);
      modelSpec = await domainModel.getEntitySpec(props.field.spec!.related_to);
      if (props.field.value) {
        items.value = await Promise.all(props.field.value.asArray().map((i) => selectedItem(i)));
      }
    });

    watch(props.field.refValue, async (fieldValue: any) => {
      if (fieldValue) {
        items.value = await Promise.all(fieldValue.asArray().map((i) => selectedItem(i)));
      } else {
        items.value = [];
      }
    });

    const searchWatchCallback = (value: string) => value && searchObjects(value);

    watch(searchInput, searchWatchCallback);

    onUnmounted(() => clearTimeout(timer));

    const getValue = computed(() => {
      if (!props.field.value) {
        return undefined;
      }
      return props.field.value.asArray();
    });

    async function openTable() {
      assertIsDefined(modelSpec);
      const executeProps: any = {
        apiModel: modelSpec.name,
        selections: true,
        multipleChoiceMode: true,
        inputSelectedRows: props.field.value ? new Set(props.field.value.asArray()) : new Set(),
        conf: {
          adding_button: false,
          deleting_button: false,
          auto_width_button: false,
          export_tables_button: false,
          aggregation_button: false,
          export_excel_button: false,
        },
      };
      const extra = props.field.extra;
      if (extra) {
        if (extra.smartTableProps) {
          Object.assign(executeProps, extra.smartTableProps);
        }
        if (extra.externalFilters) {
          executeProps.externalFilters = extra.externalFilters;
        }
        if (extra.extraParams) {
          executeProps.extraParams = extra.extraParams;
        }
      }

      const result = await executeComponent('smart-table', executeProps, workspaceManager);
      if (result && result.modalResult === ModalResult.Accepted && result.payload) {
        props.field.value = fieldValueFromArray([...result.payload]);
      }
      fieldFrame.value.focus();
    }

    return {
      fieldFrame,
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      onChange,
      items,
      searchInput,
      getValue,
      openTable,
    };
  },
});
</script>
