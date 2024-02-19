import {provide} from 'vue';
import {workspaceManagerInjectionKey, initWorkspaceManager} from '~/framework/workspace-manager/workspace-manager';

export default (context: any, inject: any) => {
  const workspaceManager = initWorkspaceManager(context.app.router, context.app.$domainModel);
  inject('workspaceManager', workspaceManager);
  const mixins = context.app.mixins ?? [];
  mixins.push({
    setup() {
      provide(workspaceManagerInjectionKey, workspaceManager);
    },
  });
  context.app.mixins = mixins;
};
