import {FieldSpec} from '~/framework/dbd/dbd-spec';

export function checkIsFilled(value: string | undefined): true | string {
  return Boolean(value) || 'Поле должно быть заполнено';
}

export function useRequiredRule(fieldSpec: FieldSpec | undefined) {
  const rules = ref<Array<typeof checkIsFilled>>([]);
  if (fieldSpec && fieldSpec.required) {
    rules.value.push(checkIsFilled);
  }
  return rules;
}
