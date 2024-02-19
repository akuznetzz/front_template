import {Model, RelatedModels} from '~/components/SmartTable/DRestResponse';
import {assert} from '~/common/assertions';
import {FULL_FIELD_NAME_SEPARATOR} from '~/framework/edit-frame/input-controls/object-choice/get-semantic-fields';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';
import {
  dateTimeToDateTimeString,
  dateToDateString,
  isoStringToDateTime,
  isoStringToDateTimeWithoutTZ,
} from '~/common/date-conversion';

function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

async function collectDescription(
  result: string[],
  semanticFieldSplit: string[],
  modelSpec: IEntitySpec,
  model: Model,
  relatedModels: RelatedModels,
) {
  assert(semanticFieldSplit.length > 0);
  const field = semanticFieldSplit[0];
  const fieldSpec = modelSpec.getFieldSpec(field);
  const relatedModelName = fieldSpec.related_to;
  if (relatedModelName) {
    const relatedModelSpec = await modelSpec.domainModel.getEntitySpec(relatedModelName);
    const modelById = relatedModels.get(relatedModelName);
    if (isDefined(modelById)) {
      const relatedModel = modelById.get(model[field]);
      if (isDefined(relatedModel)) {
        await collectDescription(result, semanticFieldSplit.slice(1), relatedModelSpec, relatedModel, relatedModels);
      }
    }
    return;
  }
  switch (fieldSpec.type) {
    case 'date': {
      result.push(dateToDateString(isoStringToDateTime(model[field])));
      break;
    }
    case 'datetime': {
      result.push(dateTimeToDateTimeString(isoStringToDateTime(model[field])));
      break;
    }
    case 'datetime without tz': {
      result.push(dateTimeToDateTimeString(isoStringToDateTimeWithoutTZ(model[field])));
      break;
    }
    default: {
      result.push(model[field]);
    }
  }
}

export async function getDescription(
  modelSpec: IEntitySpec,
  model: Model,
  relatedModels: RelatedModels,
  semanticFields: string[],
): Promise<string> {
  const result: string[] = [];
  for (const semanticField of semanticFields) {
    const semanticFieldSplit = semanticField.split(FULL_FIELD_NAME_SEPARATOR);
    await collectDescription(result, semanticFieldSplit, modelSpec, model, relatedModels);
  }
  if (result.length === 0) {
    return '<описания нет>';
  }
  return result.join(' ');
}
