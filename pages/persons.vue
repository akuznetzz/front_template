<template>
  <workspace ref="workspace">
    <template #rootContext>
      <div class="pa-3" style="width: 100%; height: 100%">
        <smart-table
          style="width: 100%; height: 100%"
          api-model="persons"
          :conf="{column: true, filter: true, sort: false, selections: true}"
        />
      </div>
    </template>
  </workspace>
</template>

<script lang="ts">
import SmartTable from '~/components/SmartTable/SmartTable.vue';
import Workspace from '~/framework/workspace-components/workspace.vue';

export default defineComponent({
  components: {
    Workspace,
    SmartTable,
  },
});
</script>
