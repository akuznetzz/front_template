export function camelCaseToKebabCase(camelCaseStrig: string): string {
  return camelCaseStrig
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
    .toLowerCase();
}
