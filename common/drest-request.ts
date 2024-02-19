import {buildInFilter, Filters, filtersToDRestUrlString} from '~/common/filters';
import {Sorts, sortsToDRestUrlString} from '~/common/sorts';
import {buildDRestResponse, DRestResponse, Model, Models} from '~/components/SmartTable/DRestResponse';
import {httpDelete, httpGet, httpPatch, httpPost} from '~/framework/httpRequest';
import {
  Excludes,
  Includes,
  includesToDRestUrlString,
  listExcludesToDRestUrlString, listIncludesToDRestUrlString
} from '~/common/includes';
import {assert} from '~/common/assertions';
import {fieldValueFromNumber} from '~/common/FieldValue';
import {IDomainModel, IEntitySpec} from '~/framework/dbd/dbd-spec';
import {aggregationsToDRestUrlString} from '~/common/aggregations';

interface Options {
  excludes?: Excludes;
  includes?: Includes;
  filters?: Filters;
  sorts?: Sorts;
  pageNumber?: number;
  pageSize?: number;
  extraParams?: Object;
}

function paramsToQueryString(params: Object): string {
  return Object.keys(params)
    .map((key) => `${key}=${(params as any)[key]}`)
    .join('&');
}

export function buildDRestRequestWithEntitySpecQueryPart(
  options?: Options
): string {
  const excludesPart = listExcludesToDRestUrlString(options?.excludes);
  const includesPart = options?.excludes === undefined ? includesToDRestUrlString(options?.includes) : listIncludesToDRestUrlString(options?.includes);
  const filtersPart = options?.filters ? filtersToDRestUrlString(options.filters) : '';
  const sortsPart = options?.sorts ? sortsToDRestUrlString(options.sorts) : '';
  const pageNumberPart = options?.pageNumber ? `page=${options.pageNumber}` : '';
  const pageSizePart = options?.pageSize ? `per_page=${options.pageSize}` : '';
  const extraParamsPart = options?.extraParams ? paramsToQueryString(options?.extraParams) : '';
  return [excludesPart, includesPart, filtersPart, sortsPart, pageNumberPart, pageSizePart, extraParamsPart]
    .filter((item) => item)
    .join('&');
}

export async function performDRestRequestWithEntitySpec(
  entitySpec: IEntitySpec,
  options?: Options,
): Promise<DRestResponse> {
  const queryPart = buildDRestRequestWithEntitySpecQueryPart(options);
  const response = await httpGet(`${entitySpec.url}?${queryPart}`);
  return buildDRestResponse(response.data, entitySpec.name);
}

export async function performDRestAggregationRequestWithEntitySpec(
  entitySpec: IEntitySpec,
  options: any,
): Promise<Object> {
  const aggregationsPart = aggregationsToDRestUrlString(options.aggregations);
  const filtersPart = options.filters ? filtersToDRestUrlString(options.filters) : '';
  const queryPart = [aggregationsPart, filtersPart].filter((item) => item).join('&');
  const response = await httpGet(`${entitySpec.url}?${queryPart}`);
  return response.data.aggregations;
}

export async function performDRestAggregationRequest(
  domainModel: IDomainModel,
  modelName: string,
  options: any,
): Promise<Object> {
  const entitySpec = await domainModel.getEntitySpec(modelName);
  return performDRestAggregationRequestWithEntitySpec(entitySpec, options);
}

export async function performDRestRequest(
  domainModel: IDomainModel,
  modelName: string,
  options?: Options,
): Promise<DRestResponse> {
  const entitySpec = await domainModel.getEntitySpec(modelName);
  return await performDRestRequestWithEntitySpec(entitySpec, options);
}

export async function performDRestSelectWithEntitySpec(
  entitySpec: IEntitySpec,
  options?: Options,
): Promise<DRestResponse> {
  const queryPart = buildDRestRequestWithEntitySpecQueryPart(options);
  const postData = {query:`${entitySpec.url}?${queryPart}`};
  const response = await httpPost('drest-select/', postData);
  return buildDRestResponse(response.data, entitySpec.name);
}

export async function performDRestSelect(
  domainModel: IDomainModel,
  modelName: string,
  options?: Options,
): Promise<DRestResponse> {
  const entitySpec = await domainModel.getEntitySpec(modelName);
  return await performDRestSelectWithEntitySpec(entitySpec, options);
}

export async function performPatchWithModelSpec(
  modelSpec: IEntitySpec,
  modelPrimaryKeyValue: number,
  data: Object,
): Promise<Model> {
  const response = await httpPatch(`${modelSpec.url}/${modelPrimaryKeyValue}`, data);
  return getModelFromResponse(modelSpec, response);
}

export async function performPatch(
  domainModel: IDomainModel,
  modelName: string,
  modelPrimaryKeyValue: number,
  data: Object,
): Promise<Model> {
  const modelSpec = await domainModel.getEntitySpec(modelName);
  return await performPatchWithModelSpec(modelSpec, modelPrimaryKeyValue, data);
}

export async function performPostWithModelSpec(modelSpec: IEntitySpec, data: Object): Promise<Model> {
  const response = await httpPost(`${modelSpec.url}`, data);
  return getModelFromResponse(modelSpec, response);
}

export async function performPost(domainModel: IDomainModel, modelName: string, data: Object): Promise<Model> {
  const modelSpec = await domainModel.getEntitySpec(modelName);
  return performPostWithModelSpec(modelSpec, data);
}

export async function performDelete(domainModel: IDomainModel, modelName: string, primaryKeyValue: number) {
  const entitySpec = await domainModel.getEntitySpec(modelName);
  await httpDelete(`${entitySpec.url}/${primaryKeyValue}`);
}

function getModelFromResponse(modelSpec: IEntitySpec, response: any) {
  const dRestResponse = buildDRestResponse(response.data, modelSpec.options!.resource_name);
  assert(dRestResponse.mainModels.length === 1);
  return dRestResponse.mainModels[0];
}

export async function getModelByPrimaryKeyValueAndModelSpec(
  modelSpec: IEntitySpec,
  primaryKeyValue: number,
  includes?: Includes,
): Promise<Model> {
  let url: string = `${modelSpec.url}/${primaryKeyValue}`;
  if (includes) {
    url = `${url}?${includesToDRestUrlString(includes)}`;
  }
  const response = await httpGet(url);
  return getModelFromResponse(modelSpec, response);
}

export async function getModelByPrimaryKeyValue(
  domainModel: IDomainModel,
  modelName: string,
  primaryKeyValue: number,
): Promise<Model> {
  return await getModelByPrimaryKeyValueAndModelSpec(await domainModel.getEntitySpec(modelName), primaryKeyValue);
}

export async function getModelsByPrimaryKeyValues(
  domainModel: IDomainModel,
  modelName: string,
  primaryKeyValues: number[],
): Promise<Models> {
  if (primaryKeyValues.length === 0) {
    return [];
  }
  const entitySpec = await domainModel.getEntitySpec(modelName);
  const dRestResponse = await performDRestRequest(domainModel, modelName, {
    filters: [
      buildInFilter(
        entitySpec.primaryKey,
        primaryKeyValues.map((primaryKeyValue) => fieldValueFromNumber(primaryKeyValue)),
      ),
    ],
  });
  return dRestResponse.mainModels;
}
