import {getEntitySettings} from '~/common/settings';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';
import {assert} from '~/common/assertions';

export const FULL_FIELD_NAME_SEPARATOR = '.';

async function collectSemanticFieldsByField(
  semanticFields: string[],
  modelSpec: IEntitySpec,
  field: string,
  fieldsPrefix?: string,
) {
  const fieldNameSplit = field.split(FULL_FIELD_NAME_SEPARATOR);
  assert(fieldNameSplit.length > 0);
  const fullField = fieldsPrefix
    ? [fieldsPrefix, fieldNameSplit[0]].join(FULL_FIELD_NAME_SEPARATOR)
    : fieldNameSplit[0];
  const relatedModel = modelSpec.getFieldSpec(fieldNameSplit[0]).related_to;
  if (relatedModel) {
    const relatedModelSpec = await modelSpec.domainModel.getEntitySpec(relatedModel);
    if (fieldNameSplit.length === 1) {
      await collectSemanticFields(semanticFields, relatedModelSpec, fullField);
    } else {
      await collectSemanticFieldsByField(
        semanticFields,
        relatedModelSpec,
        fieldNameSplit.slice(1).join(FULL_FIELD_NAME_SEPARATOR),
        fullField,
      );
    }
  } else {
    semanticFields.push(fullField);
  }
}

async function collectSemanticFields(result: string[], modelSpec: IEntitySpec, fieldsPrefix?: string) {
  const entitySettings = getEntitySettings(modelSpec.name);
  // fixme: get rid of targetField and use only semanticFields
  const semanticFieldsSet = new Set<string>();
  if (entitySettings?.semanticFields) {
    entitySettings.semanticFields.forEach((field) => semanticFieldsSet.add(field));
  } else if (entitySettings?.targetField) {
    semanticFieldsSet.add(entitySettings.targetField);
  }
  if (semanticFieldsSet.size === 0) {
    semanticFieldsSet.add('name');
  }
  for (const semanticField of semanticFieldsSet.values()) {
    await collectSemanticFieldsByField(result, modelSpec, semanticField, fieldsPrefix);
  }
}

export async function getSemanticFields(modelSpec: IEntitySpec, prefix?: string): Promise<string[]> {
  const result: string[] = [];
  await collectSemanticFields(result, modelSpec, prefix);
  return result;
}
