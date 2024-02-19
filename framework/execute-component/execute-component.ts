import {IWorkspaceManager} from '~/framework/workspace-manager/workspace-manager-spec.ts';

export async function executeComponent(
  componentName: string,
  props: Object = {},
  workspaceManager?: IWorkspaceManager,
  contextTitle?: string,
) {
  const wrkSpaceMan = workspaceManager ?? ((window.$nuxt as any).$workspaceManager as IWorkspaceManager);
  return await wrkSpaceMan.executeDynamicComponent({name: componentName, props}, contextTitle);
}
