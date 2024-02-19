import {EDEvent} from '~/framework/core/enhanced-delegation';
import {GetDBObjectDescriptionParameters} from '~/framework/edit-frame/input-controls/object-choice/get-dbobject-description';
import {performDRestRequestWithEntitySpec} from '~/common/drest-request';
import {buildSimpleFilter, Condition} from '~/common/filters';
import {fieldValueFromNumber} from '~/common/FieldValue';
import {assert} from '~/common/assertions';
import {getSemanticFields} from '~/framework/edit-frame/input-controls/object-choice/get-semantic-fields';
import {getIncludes} from '~/framework/edit-frame/input-controls/object-choice/get-includes';
import {getDescription} from '~/framework/edit-frame/input-controls/object-choice/get-description';

export async function defaultGetDBObjectDescription(event: EDEvent) {
  const parameters = event.parameters as GetDBObjectDescriptionParameters;
  const semanticFields = await getSemanticFields(parameters.modelSpec);
  const dRestResponse = await performDRestRequestWithEntitySpec(parameters.modelSpec, {
    filters: [
      buildSimpleFilter(
        parameters.modelSpec.primaryKey,
        Condition.Equals,
        fieldValueFromNumber(parameters.primaryKeyValue),
      ),
    ],
    includes: getIncludes(parameters.modelSpec, semanticFields),
  });
  if (dRestResponse.mainModels.length === 0) {
    parameters.description = '--- недоступно ---';
    return;
  }
  assert(
    dRestResponse.mainModels.length === 1,
    `Expected exactly one record with primarykey=${parameters.primaryKeyValue}`,
  );
  const mainModel = dRestResponse.mainModels[0];
  parameters.description = await getDescription(
    parameters.modelSpec,
    mainModel,
    dRestResponse.relatedModels,
    semanticFields,
  );
}
