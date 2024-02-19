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
    hide-no-data
    hide-selected
    item-text="description"
    item-value="id"
    validate-on-blur
    @change="onChange"
  >
    <template #append-outer>
      <v-icon v-if="!field.readOnly" @click="openTable"> mdi-dots-horizontal-circle-outline </v-icon>
      <v-icon
        v-if="canOpenCard()"
        :disabled="field.value === undefined"
        class="pl-2"
        @click="openCard"
        @mousedown="mouseDown"
      >
        mdi-application-import
      </v-icon>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import {FieldValue, fieldValueFromNumber} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {sendSearchDBObjects} from '~/framework/edit-frame/input-controls/object-choice/search-dbobjects';
import {assertIsDefined} from '~/common/assertions';
import {DBObject} from '~/framework/edit-frame/input-controls/object-choice/dbobject';
import {getDBObjectDescription} from '~/framework/edit-frame/input-controls/object-choice/get-dbobject-description';
import {executeEditCard, openTableCard} from '~/framework/open-edit-card';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import {executeComponent} from '~/framework/execute-component/execute-component';
import {EDEvent, sendEvent} from '~/framework/core/enhanced-delegation';
import {
  openChoiceObjectCardEventId,
  OpenChoiceObjectCardParameters,
} from '~/framework/edit-frame/input-controls/object-choice/open-choice-card-event';
import {error} from '~/framework/messages';

const SEARCH_DELAY = 1000;

export default defineComponent({
  name: 'ObjectChoiceControl',

  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },

  setup(props) {
    const root = getCurrentInstance().proxy;
    const workspaceManager = (root as any).$workspaceManager;
    const domainModel = (root as any).$domainModel;
    let modelSpec: IEntitySpec | undefined;
    const fieldFrame = ref<any>(null);

    onMounted(async () => {
      assertIsDefined(props.field.spec!.related_to);
      modelSpec = await domainModel.getEntitySpec(props.field.spec!.related_to);
      if (props.field.value) {
        items.value = await selectedItem(props.field.value.asNumber());
      }
      await addDBObjectForValue(props.field.value);
    });

    const rules = useRequiredRule(props.field.spec!);

    const getValue = computed(() => (props.field.value ? props.field.value.asNumber() : undefined));

    function onChange(value: number | undefined) {
      props.field.value = value ? fieldValueFromNumber(value) : undefined;
    }

    const items = ref<DBObject[]>([]);
    const searchInput = ref('');

    const searchWatchCallback = (value: string) => value && searchObjects(value);
    let searchWatch = watch(searchInput, searchWatchCallback);

    let timer: number;

    function searchObjects(searchString: string) {
      clearTimeout(timer);
      timer = window.setTimeout(async () => {
        items.value = await sendSearchDBObjects(
          modelSpec!,
          searchString,
          props.field?.extra?.externalFilters,
          props.field?.extra?.extraParams || props.field?.extra?.smartTableProps?.extraParams,
        );
      }, SEARCH_DELAY);
    }

    onUnmounted(() => clearTimeout(timer));

    async function openTable() {
      assertIsDefined(modelSpec);
      const executeProps: any = {apiModel: modelSpec.name, choiceMode: true};
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
      if (result && result.modalResult === ModalResult.Accepted && result.payload && result.payload.primaryKey) {
        props.field.value = fieldValueFromNumber(result.payload.primaryKey);
      }
      fieldFrame.value.focus();
    }

    async function selectedItem(primaryKey: number) {
      let selectedDescription = '';
      try {
        selectedDescription = await getDBObjectDescription(modelSpec!, primaryKey);
      } catch (e) {
        error(`Ошибка формирования текста поля "${props.field.spec!.label}" для id=${primaryKey}.`);
      }
      return [{id: primaryKey, description: selectedDescription}];
    }

    async function addDBObjectForValue(value: FieldValue | undefined) {
      if (value) {
        assertIsDefined(modelSpec);
        const primaryKeyValue = value.asNumber();
        searchWatch();
        try {
          let objectDescription = '';
          try {
            objectDescription = await getDBObjectDescription(modelSpec, primaryKeyValue);
          } catch (e) {
            error(`Ошибка формирования текста поля "${props.field.spec!.label}" для id=${primaryKeyValue}.`);
          }
          searchInput.value = objectDescription;
          items.value = [{id: primaryKeyValue, description: objectDescription}];
        } finally {
          searchWatch = watch(searchInput, searchWatchCallback);
        }
      }
    }

    watch(props.field.refValue, addDBObjectForValue);

    function canOpenCard() {
      const extra = props.field.extra;
      return !(extra && extra.disableOpenCard);
    }

    async function defaultOpenCard(event: EDEvent) {
      const parameters = event.parameters as OpenChoiceObjectCardParameters;
      parameters.cardResult = await executeEditCard(parameters.tableName, parameters.objectID, parameters.props);
    }

    async function openCard() {
      assertIsDefined(modelSpec);
      assertIsDefined(props.field.hasValue);
      const openChoiceObjectCardParameters: OpenChoiceObjectCardParameters = {
        tableName: modelSpec.name,
        objectID: props.field.asNumber(),
        cardResult: undefined,
        props: props.field?.extra?.editCardProps,
      };
      await sendEvent(props.field, openChoiceObjectCardEventId, openChoiceObjectCardParameters, defaultOpenCard);
    }

    async function mouseDown(event: any) {
      if (event.button === 1) {
        await openTableCard(
          modelSpec!.name,
          props.field.value ? props.field.value.asNumber() : undefined,
          undefined,
          true,
        );
      }
    }

    return {
      fieldFrame,
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      onChange,
      items,
      searchInput,
      openTable,
      getValue,
      canOpenCard,
      mouseDown,
      openCard,
    };
  },
});
</script>

<style scoped></style>
