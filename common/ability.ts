import {Ability, AbilityClass, Subject} from '@casl/ability';

export const CREATE = 'create';
export const READ = 'read';
export const UPDATE = 'update';
export const DELETE = 'delete';
export type CRUD = typeof CREATE | typeof READ | typeof UPDATE | typeof DELETE;
export type AppAbilityType = Ability<[CRUD | string, Subject]>;
export const AppAbility = Ability as AbilityClass<AppAbilityType>;
export const ability = new AppAbility();

export function FORM(apiModel: string): boolean {
  return window.$nuxt.$can(READ, apiModel);
}
