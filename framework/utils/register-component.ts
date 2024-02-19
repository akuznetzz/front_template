import Vue from 'vue';
import {assertIsDefined} from '~/common/assertions';
import {camelCaseToKebabCase} from '~/framework/utils/camel-case-to-kebab-case';

export function componentNameToKebabCase(component: any): string {
  assertIsDefined(component.name, 'Kebab: компонент без имени!');
  return camelCaseToKebabCase(component.name);
}

export function registerVueComponent(vueComponent: any, name?: string): void {
  Vue.component(name ?? componentNameToKebabCase(vueComponent), vueComponent);
}
