// @ts-ignore
export const validationRules = new Map([
  ['required', (value: any) => !!value || 'Поле должно быть заполнено'],
  ['number', (value: any) => Number.isInteger(+value) || 'Значение должно быть целым числом'],
]);
