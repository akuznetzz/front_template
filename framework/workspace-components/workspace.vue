<template>
  <v-carousel light :value="activeIndex" :show-arrows="false" :hide-delimiters="true" :cycle="false" height="100%">
    <v-carousel-item>
      <div class="d-flex justify-center" style="height: 100%">
        <slot name="rootContext" />
      </div>
    </v-carousel-item>

    <v-carousel-item v-for="context in pathContexts" :key="context.uuid">
      <div class="d-flex justify-center" style="height: 100%">
        <workspace-context :context="context" :close-now="context.dynamicComponent.onCloseContext" />
      </div>
    </v-carousel-item>
  </v-carousel>
</template>

<script lang="ts">
import {IWorkspaceManager} from '~/framework/workspace-manager/workspace-manager-spec';
import WorkspaceContext from '~/framework/workspace-components/workspace-context.vue';

export default defineComponent({
  name: 'Workspace',

  components: {
    WorkspaceContext,
  },

  setup() {
    const root = getCurrentInstance().proxy;
    const $router = (root as any).$router;
    const workspaceManager = (window.$nuxt as any).$workspaceManager as IWorkspaceManager;

    const pathContexts = computed(() => {
      return workspaceManager.getPathContexts($router.currentRoute.path);
    });

    const activeIndex = computed(() => {
      return pathContexts.value.findIndex((item: any) => item.active) + 1;
    });

    return {
      pathContexts,
      activeIndex,
    };
  },
});
</script>

<style scoped></style>
