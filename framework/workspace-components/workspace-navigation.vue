<template>
  <v-flex v-if="pathContexts && pathContexts.length > 0" style="max-width: 1000px">
    <v-row justify="start" align="start" class="ml-1">
      <v-btn text icon small color="primary" @click="closeWorkspace()">
        <v-icon class="pt-1"> mdi-close </v-icon>
      </v-btn>
      <v-chip
        v-for="item in pathContexts"
        :key="item.uuid"
        class="ml-1 pl-1 pr-1"
        label
        :link="item.active"
        :close="item.active"
        :dark="item.active"
        :color="item.active ? 'primary' : ''"
        @click:close="closeItem(item)"
      >
        {{ item.title }}
      </v-chip>
    </v-row>
  </v-flex>
</template>

<script lang="ts">
import {workSpaceCloseEditCardId, WorkSpaceCloseEditCardParameters} from './workspace-events';
import {ModalResult, IWorkspaceContext, IWorkspaceManager} from '~/framework/workspace-manager/workspace-manager-spec';
import {sendEvent, EDEvent} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';

export default defineComponent({
  name: 'WorkspaceContext',

  setup() {
    const root = getCurrentInstance().proxy;
    const workspaceManager = (window.$nuxt as any).$workspaceManager as IWorkspaceManager;
    const currPath = ref((root as any).$route.path);
    const nextCloseLoop = ref(true);

    const pathContexts = computed(() => {
      return workspaceManager.getPathContexts(currPath.value);
    });

    watch(
      () => (root as any).$route,
      (to, from) => {
        workspaceManager.closeAllContextsOfPath(from.path as string);
        currPath.value = to.path as string;
      },
    );

    async function closeWorkspace() {
      nextCloseLoop.value = true;
      while (true) {
        const contextLength = (workspaceManager as any).contexts.value.length;
        if (!contextLength || !nextCloseLoop.value) {
          break;
        }
        await closeItem((workspaceManager as any).contexts.value[contextLength - 1]);
      }
    }

    async function closeItem(context: IWorkspaceContext) {
      await sendEvent(appEventList, workSpaceCloseEditCardId, {context, nextLoop: true}, defaultCloseItem);
    }

    async function defaultCloseItem(event: EDEvent) {
      const parameters = event.parameters as WorkSpaceCloseEditCardParameters;
      if (parameters.nextLoop) {
        await workspaceManager.closeContext({
          context: parameters.context as IWorkspaceContext,
          result: {modalResult: ModalResult.Denied},
        });
      } else {
        nextCloseLoop.value = false;
      }
    }

    return {
      pathContexts,
      closeWorkspace,
      closeItem,
    };
  },
});
</script>

<style scoped></style>
