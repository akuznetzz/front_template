import {EDEvent} from '~/framework/core/enhanced-delegation';
import {GetExecuteComponentNameParameters} from '~/framework/execute-component/execute-component-spec';
import {getEditCardName} from '~/components/EntitiesEditCards/EditCardList';

export function defaultSearchComponentName(event: EDEvent) {
  const parameters = event.parameters as GetExecuteComponentNameParameters;
  parameters.componentName = getEditCardName(parameters.tableName);
}
