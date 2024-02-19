<template>
  <workspace ref="workspace" />
</template>

<script lang="ts">
import {executeEditCard} from '~/framework/open-edit-card';
import Workspace from '~/framework/workspace-components/workspace.vue';

export default defineComponent({
  name: 'TablesCard',

  components: {
    Workspace,
  },

  props: {
    tableName: {
      type: String,
      required: true,
    },
    primaryKey: {
      type: String,
      required: false,
    },
  },

  setup(props) {
    onMounted(async () => {
      await executeEditCard(props.tableName, props.primaryKey ? Number(props.primaryKey) : undefined);
    });
  },
});
</script>

<style scoped></style>
