import {Includes} from '~/common/includes';
import {FULL_FIELD_NAME_SEPARATOR} from '~/framework/edit-frame/input-controls/object-choice/get-semantic-fields';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';

export function getIncludes(_modelSpec: IEntitySpec, semanticFields: string[]): Includes {
  const includesSet = new Set<string>();
  for (const semanticField of semanticFields) {
    // cut off last field in semantic full field name, because for fields like `purchase.rightholder.last_name`
    // includes should be `purchase.rightholder.*` and `.*` part is added by performDRestRequest
    const include = semanticField.split(FULL_FIELD_NAME_SEPARATOR).slice(0, -1).join(FULL_FIELD_NAME_SEPARATOR);
    if (include) {
      includesSet.add(include);
    }
  }
  return Array.from(includesSet.values());
}
