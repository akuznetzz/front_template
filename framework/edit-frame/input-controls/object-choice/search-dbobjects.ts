import {sendEvent} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';
import {assertIsDefined} from '~/common/assertions';
import {DBObject} from '~/framework/edit-frame/input-controls/object-choice/dbobject';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';

export const searchDBObjectsEventId = Symbol('searchDBObjectsEventId');

export interface SearchDBObjectsParameters {
  modelSpec: IEntitySpec; // in
  searchString: string; // in
  externalFilters: any | undefined; // in
  extraParams: any | undefined; // in
  dbobjects: DBObject[] | undefined; // out
}

export async function sendSearchDBObjects(
  modelSpec: IEntitySpec,
  searchString: string,
  externalFilters?: any,
  extraParams?: any,
): Promise<DBObject[]> {
  const searchDBObjectsParameters: SearchDBObjectsParameters = {
    modelSpec,
    searchString,
    externalFilters,
    extraParams,
    dbobjects: undefined,
  };
  await sendEvent(appEventList, searchDBObjectsEventId, searchDBObjectsParameters);
  assertIsDefined(searchDBObjectsParameters.dbobjects);
  return searchDBObjectsParameters.dbobjects;
}
