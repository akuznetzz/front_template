import {CheckedReadonlyMap, CheckedReadonlyMapImpl} from '~/common/CheckedReadonlyMap';
import {contentTypeModelsMap} from '~/common/dispatcher';
import {buildInFilter} from '~/common/filters';
import {performDRestRequest} from '~/common/drest-request';
import {fieldValueFromString} from '~/common/FieldValue';

export type ContentTypeIdToModelClassMap = CheckedReadonlyMap<number, string>;
export type ModelClassToContentTypeIdMap = CheckedReadonlyMap<string, number>;

let contentTypeIdToModelClassMap: ContentTypeIdToModelClassMap;
let modelClassToContentTypeIdMap: ModelClassToContentTypeIdMap;

async function collectContentTypeToModelClassMaps(): Promise<
  [ContentTypeIdToModelClassMap, ModelClassToContentTypeIdMap]
> {
  // @ts-ignore $domainModel
  const domainModel = window.$nuxt.$domainModel;
  const dRestResponse = await performDRestRequest(domainModel, 'contenttypes', {
    filters: [
      buildInFilter(
        'model',
        Array.from(contentTypeModelsMap.keys()).map((model) => fieldValueFromString(model)),
      ),
    ],
  });
  const contentTypeToModelClass = new CheckedReadonlyMapImpl<number, string>();
  const modelClassToContentType = new CheckedReadonlyMapImpl<string, number>();
  for (const model of dRestResponse.mainModels) {
    contentTypeToModelClass.set(model['id'], model['model']);
    modelClassToContentType.set(model['model'], model['id']);
  }
  return [contentTypeToModelClass, modelClassToContentType];
}

export async function getContentTypeIdToModelClassMap(): Promise<ContentTypeIdToModelClassMap> {
  if (!contentTypeIdToModelClassMap) {
    await init();
  }
  return contentTypeIdToModelClassMap;
}

export async function getModelClassByContentTypeId(contentTypeId: number) {
  return (await getContentTypeIdToModelClassMap()).checkedGet(contentTypeId);
}

export async function getModelClassToContentTypeIdMap(): Promise<ModelClassToContentTypeIdMap> {
  if (!modelClassToContentTypeIdMap) {
    await init();
  }
  return modelClassToContentTypeIdMap;
}

export async function getContentTypeIdByModelClass(modelClass: string) {
  return (await getModelClassToContentTypeIdMap()).checkedGet(modelClass);
}

async function init() {
  [contentTypeIdToModelClassMap, modelClassToContentTypeIdMap] = await collectContentTypeToModelClassMaps();
}
