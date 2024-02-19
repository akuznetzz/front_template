<template>
  <smart-table
    ref="table"
    v-if="contentTypeId"
    :all-columns="getActionsTableColumns()"
    :external-filters="actionsExternalFilters"
    :filtering="false"
    api-model="actions"
    style="width: 100%"
  />
</template>

<script lang="ts">
import {getContentTypeIdByModelClass} from '@/common/content-type-dict';
import SmartTable from '~/components/SmartTable/SmartTable.vue';
import {getEntitySetting} from '~/common/settings';
import {buildSimpleFilter, Condition} from '~/common/filters';
import {fieldValueFromNumber} from '~/common/FieldValue';

export default defineComponent({
  name: 'ActionsTable',
  components: {SmartTable},
  props: {
    contentTypeName: {
      type: String,
      required: false,
    },
    objectId: {
      type: [String, Number],
      required: false,
    },
    customFilter: {
      type: Object,
      required: false,
    },
  },
  setup(props) {
    const contentTypeId: any = ref();

    const table: any = ref(null);

    const actionsExternalFilters = computed(() => {
      if (props.customFilter) {
        return props.customFilter;
      }
      return {
        filter: [
          buildSimpleFilter('target_content_type', Condition.Equals, fieldValueFromNumber(contentTypeId.value!)),
          buildSimpleFilter('target_object_id', Condition.Equals, fieldValueFromNumber(Number(props.objectId)!)),
        ],
      };
    });

    function getActionsTableColumns() {
      return getEntitySetting('actions', 'allColumns');
    }

    function refresh() {
      table.value.reloadData();
    }

    onMounted(async () => {
      if (props.contentTypeName) {
        contentTypeId.value = await getContentTypeIdByModelClass(props.contentTypeName!);
      }
    });

    watch(
      () => props.objectId,
      () => table.value.setExternalFilters(actionsExternalFilters.value),
    );

    watch(
      () => props.customFilter,
      (customFilter) => table.value.setExternalFilters(customFilter!.value),
    );

    return {
      getActionsTableColumns,
      actionsExternalFilters,
      table,
      refresh,
      contentTypeId,
    };
  },
});
</script>
