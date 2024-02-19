<template>
  <div :style="`${choiceCardStyle ? choiceCardStyle : 'width: 800px'}`">
    <smart-table
      ref="smartTable"
      style="width: 100%; height: 90%"
      :api-model="apiModel"
      :conf="choiceTableConf"
      :selections="true"
      :input-selected-rows="selectedRows"
      :external-filters="externalFilters"
      :includes="includes"
      :all-columns="allColumns"
      :shown-column-names="shownColumnNames"
      :extra-params="extraParams"
      :table-name="tableName"
    />
    <div>
      <v-btn color="success" class="mt-2" @click="acceptClicked()">
        <v-icon left> mdi-check </v-icon>
        Принять
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import SmartTable from '~/components/SmartTable/SmartTable.vue';

const MultiChoiceProps = {
  apiModel: String,
  selectedRows: Set,
  externalFilters: Object,
  includes: Array,
  allColumns: Array,
  shownColumnNames: Array,
  choiceCardStyle: String,
  choiceTableConf: Object,
  extraParams: Object,
  tableName: String,
};
export default defineComponent({
  name: 'MultiChoice',

  components: {SmartTable},

  props: MultiChoiceProps,

  setup(_props: typeof MultiChoiceProps, {emit}: SetupContext) {
    const smartTable = ref(null);

    function acceptClicked() {
      emit('closeContext', {modalResult: ModalResult.Accepted, payload: (smartTable.value! as any).selectedRows});
    }

    return {smartTable, acceptClicked};
  },
});
</script>
