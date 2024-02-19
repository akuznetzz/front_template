<template>
  <component
    :is="componentName"
    v-bind="{...context.dynamicComponent.props.apiModelSettings, ...context.dynamicComponent.props}"
    :context="context"
    @closeContext="closeContext($event)"
  />
</template>

<script lang="ts">
import {getEditCardName} from '~/components/EntitiesEditCards/EditCardList';
import {
  ModalResult,
  IDynamicComponentResult,
  IWorkspaceContext,
  IWorkspaceManager,
} from '~/framework/workspace-manager/workspace-manager-spec';
import {EDIT_CARD_REG_NAME} from '~/components/components-config';

export default defineComponent({
  name: 'WorkspaceContext',

  props: {
    context: {
      type: Object as PropType<IWorkspaceContext>,
      required: true,
    },
    closeNow: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  setup(props) {
    const workspaceManager = (window.$nuxt as any).$workspaceManager as IWorkspaceManager;

    const componentName = computed(() => {
      return props.context.dynamicComponent.name === EDIT_CARD_REG_NAME
        ? getEditCardName(props.context.dynamicComponent.props.apiModel)
        : props.context.dynamicComponent.name;
    });

    const closeNow = computed(() => {
      return props.closeNow;
    });

    watch(closeNow, async (closeNow) => {
      if (closeNow) {
        await closeContext({modalResult: ModalResult.Denied});
      }
    });

    async function closeContext(result: IDynamicComponentResult) {
      await workspaceManager.closeContext({context: props.context, result});
    }

    return {
      componentName,
      closeContext,
    };
  },
});
</script>

<style scoped></style>
