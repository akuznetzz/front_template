export function getLocaleFieldName(field: string): string {
  return window.$nuxt.$i18n.locale === 'ru' ? field : `english_${field}`;
}

export function t(name: string) {
  return window.$nuxt.$t(name);
}
