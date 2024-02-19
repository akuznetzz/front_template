import {sendEvent} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';
import {assertIsDefined} from '~/common/assertions';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';

export interface GetDBObjectDescriptionParameters {
  modelSpec: IEntitySpec; // in
  primaryKeyValue: number; // in
  description?: string; // out
}

export const getDBObjectDescriptionEventId = Symbol('getDBObjectDescriptionEventId');

export async function getDBObjectDescription(modelSpec: IEntitySpec, primaryKeyValue: number): Promise<string> {
  const getDBObjectDescriptionParameters: GetDBObjectDescriptionParameters = {
    modelSpec,
    primaryKeyValue,
    description: undefined,
  };
  await sendEvent(appEventList, getDBObjectDescriptionEventId, getDBObjectDescriptionParameters);
  assertIsDefined(getDBObjectDescriptionParameters.description);
  return getDBObjectDescriptionParameters.description;
}
