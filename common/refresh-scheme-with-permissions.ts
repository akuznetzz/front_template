import {AbilityBuilder} from '@casl/ability';
import RefreshScheme from '@nuxtjs/auth-next/dist/schemes/refresh';
import {ability, AppAbility, AppAbilityType, CRUD} from './ability';
import {CheckedReadonlyMapImpl} from './CheckedReadonlyMap';

const djangoActionToCRUDMap = new CheckedReadonlyMapImpl<string, CRUD>([
  ['add', 'create'],
  ['view', 'read'],
  ['change', 'update'],
  ['delete', 'delete'],
]);

function djangoActionToCRUD(action: string): CRUD | undefined {
  return djangoActionToCRUDMap.get(action);
}

interface Permissions {
  readonly [modelName: string]: string[];
}

function djangoPermissionsToAbility(permissions: Permissions, abilityBuilder: AbilityBuilder<AppAbilityType>) {
  for (const modelName in permissions) {
    const actions: string[] = permissions[modelName];
    for (const action of actions) {
      const crud = djangoActionToCRUD(action);
      if (crud) {
        abilityBuilder.can(crud, modelName);
      } else {
        // custom permission
        abilityBuilder.can(action, modelName);
      }
    }
  }
}

export default class RefreshSchemeWithPermissions extends RefreshScheme {
  async fetchUser(endpoint?: any) {
    const result = await super.fetchUser(endpoint);
    const abilityBuilder = new AbilityBuilder(AppAbility);
    djangoPermissionsToAbility(this.$auth.user.permissions, abilityBuilder);
    abilityBuilder.can('read', '$login');
    ability.update(abilityBuilder.rules);
    return result;
  }
}
