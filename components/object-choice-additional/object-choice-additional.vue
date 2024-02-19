<template>
  <v-row>
    <v-col class="pt-0 pr-0 pb-0" cols="11">
      <edit-frame :field="dataSource.fieldByName(field)" />
    </v-col>
    <v-col class="px-0" style="padding-top: 14px" cols="1">
      <v-menu offset-y>
        <template v-slot:activator="{on, attrs}">
          <v-btn :disabled="lastUsedListValues.length === 0" icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical-circle-outline</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, index) in lastUsedListValues" :key="index" @click="assignValue(item.id)">
            <v-list-item-title>{{ item.description }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import EditFrame from '~/framework/edit-frame/edit-frame.vue';
import {DataSource} from '~/framework/data-source';
import {getModelsByPrimaryKeyValues} from '~/common/drest-request';
import {fieldValueFromNumber} from '~/common/FieldValue';
import {getSemanticFields} from '~/framework/edit-frame/input-controls/object-choice/get-semantic-fields';
import {MAX_OBJECT_CHOICE_ITEM_TO_SAVE} from '~/common/constants';

export default defineComponent({
  components: {
    EditFrame,
  },
  props: {
    dataSource: {
      type: Object as PropType<DataSource>,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const root = getCurrentInstance().proxy;
    const lastUsedListIds = ref([]);
    const lastUsedListValues = ref([]);
    const localStoragePath = [
      'objectChoiceAdditional',
      props.dataSource.entityName,
      props.field,
      root.$auth.user.id,
    ].join('/');
    const semanticFields = ref([]);

    onMounted(async () => {
      semanticFields.value = await getSemanticFields(
        await (root as any).$domainModel.getEntitySpec(props.dataSource.fieldByName(props.field).spec.related_to),
      );
      loadFromLocalStorage();
    });

    async function loadFromLocalStorage() {
      if (!localStorage.getItem(localStoragePath)) {
        return;
      }
      lastUsedListIds.value = JSON.parse(localStorage.getItem(localStoragePath) || '[]');
      const result = await getModelsByPrimaryKeyValues(
        (root as any).$domainModel,
        props.dataSource.fieldByName(props.field).spec.related_to,
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

    function saveToLocalStorage() {
      if (props.dataSource.fieldByName(props.field).changed && props.dataSource.fieldByName(props.field).hasValue) {
        lastUsedListIds.value.unshift(props.dataSource.fieldByName(props.field).value.asNumber());
        lastUsedListIds.value = Array.from(new Set(lastUsedListIds.value));
        if (lastUsedListIds.value.length > MAX_OBJECT_CHOICE_ITEM_TO_SAVE) {
          lastUsedListIds.value.length = MAX_OBJECT_CHOICE_ITEM_TO_SAVE;
        }
        localStorage.setItem(localStoragePath, JSON.stringify(lastUsedListIds.value));
        loadFromLocalStorage();
      }
    }

    function assignValue(id: number) {
      props.dataSource.fieldByName(props.field).value = fieldValueFromNumber(id);
    }

    return {
      saveToLocalStorage,
      lastUsedListValues,
      assignValue,
    };
  },
});
</script>
