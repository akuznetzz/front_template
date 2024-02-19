import {EDEvent, installEventHandler, sendEvent} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';
import {
  getExecuteComponentNameAppEventId,
  getExecuteComponentPropsAppEventId,
  GetExecuteComponentNameParameters,
  GetExecuteComponentPropsParameters,
} from '~/framework/execute-component/execute-component-spec';
import {defaultSearchComponentName} from '~/framework/execute-component/default-search-component-name';
import {EDIT_CARD_REG_NAME} from '~/components/components-config';

export function setupSearchComponentNameHandler() {
  installEventHandler(appEventList, getExecuteComponentNameAppEventId, defaultSearchComponentName);
}

function defaultGetEditComponentName(event: EDEvent) {
  const parameters = event.parameters as GetExecuteComponentNameParameters;
  parameters.componentName = EDIT_CARD_REG_NAME;
  event.done = true;
}

function defaultGetEditComponentProps(event: EDEvent) {
  const params = event.parameters as GetExecuteComponentPropsParameters;
  params.componentProps = Object.assign(
    params.componentProps || {},
    {apiModel: params.tableName, primaryKeyValue: params.primaryKeyValue},
    params.props || {},
  );
}

export async function getEditComponentName(
  tableName: string,
  contextId?: string,
  primaryKeyValue?: number,
  props?: Object,
) {
  const parameters: GetExecuteComponentNameParameters = {
    tableName,
    contextId,
    primaryKeyValue,
    props,
    componentName: undefined,
  };
  await sendEvent(appEventList, getExecuteComponentNameAppEventId, parameters, defaultGetEditComponentName);
  return parameters.componentName!;
}

export async function getEditComponentProps(
  tableName: string,
  contextId?: string,
  primaryKeyValue?: number,
  props: Object = {},
  componentName?: string,
) {
  const parameters: GetExecuteComponentPropsParameters = {
    tableName,
    contextId,
    primaryKeyValue,
    props,
    componentName,
    componentProps: {},
  };
  await sendEvent(appEventList, getExecuteComponentPropsAppEventId, parameters, defaultGetEditComponentProps);
  return parameters.componentProps!;
}
