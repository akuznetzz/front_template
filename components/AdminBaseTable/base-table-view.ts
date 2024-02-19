import {performDRestRequest} from '~/common/drest-request';
import {buildIsNullFilter, buildSimpleFilter, Condition} from '~/common/filters';
import {fieldValueFromNumber, fieldValueFromString} from '~/common/FieldValue';
import {IDomainModel} from '~/framework/dbd/dbd-spec';
import {buildDataSource} from '~/framework/data-source';
import {SortDirection} from '~/common/sorts';
import {Aggregations} from '~/common/aggregations';
import {HTTP_200_OK, httpPost} from '~/framework/httpRequest';
import {warn} from '~/framework/messages';
import {dateTimeToDateTimeString, nowDateTime} from '~/common/date-conversion';

export interface BaseViewField {
  field: string;
  title?: string;
  kind?: string;
}

export type BaseViewFields = Array<BaseViewField>;

export interface BaseViewSettings {
  available_fields: BaseViewFields;
}

export interface ContextViewParams {
  excluded_fields?: BaseViewFields;
}

export type ShowFieldProps = {
  field: string;
  title?: string;
  width?: number;
};

export type ShowFieldsList = Array<ShowFieldProps>;

export interface SortFieldProps {
  field: string;
  order?: SortDirection;
}

export type SortFieldsList = Array<SortFieldProps>;

export interface FilterFieldProps {
  field: string;
  value: string;
}

export type FilterFieldsList = Array<FilterFieldProps>;

export interface TableViewProps {
  version?: number;
  columns?: ShowFieldsList;
  sorts?: SortFieldsList;
  filters?: FilterFieldsList;
  aggregations?: Aggregations;
}

export async function getBaseViewSettings(domainModel: IDomainModel, tableName: string, userContext: string = '') {
  const tableContentTypeId = (await domainModel.getEntitySpec(tableName)).options!.content_type_id;
  const response = await performDRestRequest(domainModel, 'basetableviews', {
    filters: [
      buildSimpleFilter('table_type', Condition.Equals, fieldValueFromNumber(tableContentTypeId)),
      buildSimpleFilter('context', Condition.Equals, fieldValueFromString(userContext)),
    ],
  });
  if (!response.mainModels.length || !response.mainModels[0].view_text) {
    return {};
  }
  return JSON.parse(response.mainModels[0].view_text);
}

export async function saveBaseViewSettings(domainModel: IDomainModel, tableName: string, baseViewSettings: any, userContext: string = '') {
  const tableContentTypeId = (await domainModel.getEntitySpec(tableName)).options!.content_type_id;
  const response = await performDRestRequest(domainModel, 'basetableviews', {
    filters: [
      buildSimpleFilter('table_type', Condition.Equals, fieldValueFromNumber(tableContentTypeId)),
      buildSimpleFilter('context', Condition.Equals, fieldValueFromString(userContext)),
    ],
  });
  const recordPK = response.mainModels.length ? response.mainModels[0].id : undefined;
  const dataSource = await buildDataSource(await domainModel.getEntitySpec('basetableviews'), recordPK);
  dataSource.fieldByName('table_type').value = fieldValueFromNumber(tableContentTypeId);
  dataSource.fieldByName('view_text').value = fieldValueFromString(JSON.stringify(baseViewSettings));
  dataSource.fieldByName('context').value = fieldValueFromString(userContext);
  await dataSource.save();
}

export async function getTableViewSettings(domainModel: IDomainModel, tableName: string, userContext: string = '') {
  const tableContentTypeId = (await domainModel.getEntitySpec(tableName)).options!.content_type_id;
  const response = await performDRestRequest(domainModel, 'namedviews', {
    filters: [
      buildSimpleFilter('table_type', Condition.Equals, fieldValueFromNumber(tableContentTypeId)),
      buildIsNullFilter('user'),
      buildSimpleFilter('name', Condition.Equals, fieldValueFromString('')),
      buildSimpleFilter('context', Condition.Equals, fieldValueFromString(userContext)),
    ],
  });
  if (!response.mainModels.length || !response.mainModels[0].view_text) {
    return {};
  }
  return JSON.parse(response.mainModels[0].view_text);
}

export async function saveTableViewSettings(
  domainModel: IDomainModel,
  tableName: string,
  tableViewSettings: any,
  userContext: string = '',
) {
  const tableContentTypeId = (await domainModel.getEntitySpec(tableName)).options!.content_type_id;
  const response = await performDRestRequest(domainModel, 'namedviews', {
    filters: [
      buildSimpleFilter('table_type', Condition.Equals, fieldValueFromNumber(tableContentTypeId)),
      buildIsNullFilter('user'),
      buildSimpleFilter('name', Condition.Equals, fieldValueFromString('')),
      buildSimpleFilter('context', Condition.Equals, fieldValueFromString(userContext)),
    ],
  });
  const recordPK = response.mainModels.length ? response.mainModels[0].id : undefined;
  const dataSource = await buildDataSource(await domainModel.getEntitySpec('namedviews'), recordPK);
  dataSource.fieldByName('table_type').value = fieldValueFromNumber(tableContentTypeId);
  dataSource.fieldByName('context').value = fieldValueFromString(userContext);
  dataSource.fieldByName('view_text').value = fieldValueFromString(JSON.stringify(tableViewSettings || {}));
  await dataSource.save();
}

export function baseTableHelper(domainModel: IDomainModel) {
  const availableViewFields: Ref<any> = ref([{field: 'id'}]);
  const displayedViewFields: Ref<any> = ref();
  const viewIncludes: Ref<any> = ref();

  async function getBaseTableCnf(tableName: string, userContext: string = '') {
    const baseViewSettings = await getBaseViewSettings(domainModel, tableName, userContext);
    availableViewFields.value = baseViewSettings['available_fields'];

    if (!availableViewFields.value) {
      availableViewFields.value = [];
      viewIncludes.value = undefined;
      const tableSpec = await domainModel.getEntitySpec(tableName);
      tableSpec.fieldSpecs.forEach((fieldSpec) => {
        availableViewFields.value.push({field: fieldSpec.name});
      });
    }
  }

  return {availableViewFields, displayedViewFields, viewIncludes, getBaseTableCnf};
}

export async function getFreshBaseViewSettings(domainModel: IDomainModel, tableName: string, update_dtime?: string) {
  const res = await httpPost('get-fresh-base-table-view-data/', {
    table_id: (await domainModel.getEntitySpec(tableName)).options!.content_type_id,
    update_dtime,
  });
  if (res.status !== HTTP_200_OK) {
    warn(res.data);
    return undefined;
  }
  return res.data.view_text;
}

export async function getFreshContextViewParams(domainModel: IDomainModel, tableName: string, context?: string, update_dtime?: string) {
  const res = await httpPost('get-fresh-context-view-params-data/', {
    table_id: (await domainModel.getEntitySpec(tableName)).options!.content_type_id,
    context,
    update_dtime,
  });
  if (res.status !== HTTP_200_OK) {
    warn(res.data);
    return undefined;
  }
  return res.data.view_params;
}

export function localeCacheBaseViewSettingsKey(user_uid: string, tableName: string) {
  return [user_uid, 'localeCacheBaseViewSettings', tableName].join('/');
}

export function localeCacheContextViewParamsKey(user_uid: string, tableName: string, context='') {
  return [user_uid, 'localeCacheContextViewParams', tableName, context].join('/');
}

export function updateLocaleCacheBaseViewSettings(user_uid: string, tableName: string, newBaseView: any) {
  localStorage.setItem(
    localeCacheBaseViewSettingsKey(user_uid, tableName),
    JSON.stringify({update_dtime: dateTimeToDateTimeString(nowDateTime()), base_view: newBaseView}),
  );
}

export function updateLocaleCacheContextViewParams(user_uid: string, tableName: string, context: string, newViewParams: any) {
  localStorage.setItem(
    localeCacheContextViewParamsKey(user_uid, tableName, context),
    JSON.stringify({update_dtime: dateTimeToDateTimeString(nowDateTime()), view_params: newViewParams}),
  );
}
