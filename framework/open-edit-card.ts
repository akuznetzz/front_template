import {CARD_IN_NEW_WINDOW_ROUT_NAME} from '~/common/constants';
import {executeComponent} from '~/framework/execute-component/execute-component';
import {getEditComponentName, getEditComponentProps} from '~/framework/execute-component/edit-card-config';
import {IWorkspaceManager, ModalResult} from '~/framework/workspace-manager/workspace-manager-spec.ts';

export async function executeEditCard(
  tableName: string,
  primaryKeyValue?: number,
  props?: Object,
  workspaceManager?: IWorkspaceManager,
  contextTitle?: string,
  contextId?: string,
) {
  const componentName = await getEditComponentName(tableName, contextId, primaryKeyValue, props);
  if (!componentName) {
    return {modalResult: ModalResult.Denied, payload: {primaryKey: primaryKeyValue}};
  }
  const componentProps = await getEditComponentProps(tableName, contextId, primaryKeyValue, props, componentName);
  return await executeComponent(componentName, componentProps, workspaceManager, contextTitle);
}

export async function openTableCard(tableName: string, primaryKeyValue?: number, props?: Object, inNewTab = false) {
  if (inNewTab) {
    // @ts-ignore $nuxt
    // eslint-disable-next-line no-undef
    const routeData = $nuxt.$router.resolve({
      name: CARD_IN_NEW_WINDOW_ROUT_NAME,
      params: {tableName, primaryKey: String(primaryKeyValue)},
    });
    window.open(props ? `${routeData.href}?props=${JSON.stringify(props)}` : routeData.href, '_blank');
  } else {
    return await executeEditCard(tableName, primaryKeyValue, props);
  }
}
