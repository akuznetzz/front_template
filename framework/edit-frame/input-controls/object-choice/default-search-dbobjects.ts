import {EDEvent} from '~/framework/core/enhanced-delegation';
import {SearchDBObjectsParameters} from '~/framework/edit-frame/input-controls/object-choice/search-dbobjects';
import {performDRestRequestWithEntitySpec} from '~/common/drest-request';
import {buildSimpleFilter, Condition} from '~/common/filters';
import {fieldValueFromString} from '~/common/FieldValue';
import {CheckedReadonlyMapImpl} from '~/common/CheckedReadonlyMap';
import {SortDirection} from '~/common/sorts';
import {getSemanticFields} from '~/framework/edit-frame/input-controls/object-choice/get-semantic-fields';
import {getIncludes} from '~/framework/edit-frame/input-controls/object-choice/get-includes';
import {getDescription} from '~/framework/edit-frame/input-controls/object-choice/get-description';

export async function defaultSearchObjects(event: EDEvent) {
  const parameters = event.parameters as SearchDBObjectsParameters;
  const semanticFields = await getSemanticFields(parameters.modelSpec);
  const dbobjectsMap = new CheckedReadonlyMapImpl<number, string>();
  const addFilters = parameters.externalFilters ? parameters.externalFilters.permanent ?? [] : [];
  for (const semanticField of semanticFields) {
    const dRestResponse = await performDRestRequestWithEntitySpec(parameters.modelSpec, {
      filters: [
        ...addFilters,
        buildSimpleFilter(semanticField, Condition.ContainsIgnoreCase, fieldValueFromString(parameters.searchString)),
      ],
      includes: getIncludes(parameters.modelSpec, semanticFields),
      pageSize: 20,
      sorts: [{field: semanticField, direction: SortDirection.Ascending}],
      extraParams: parameters.extraParams,
    });
    for (const mainModel of dRestResponse.mainModels) {
      const primaryKeyValue = mainModel[parameters.modelSpec.primaryKey];
      if (!dbobjectsMap.has(primaryKeyValue)) {
        dbobjectsMap.set(
          primaryKeyValue,
          await getDescription(parameters.modelSpec, mainModel, dRestResponse.relatedModels, semanticFields),
        );
      }
    }
  }
  parameters.dbobjects = Array.from(dbobjectsMap.entries()).map(([key, value]) => ({id: key, description: value}));
}
