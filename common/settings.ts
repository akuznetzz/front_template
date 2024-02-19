import {IEntitySettings} from '~/components/Workspace/workspace-spec';

export function getEntitySettings(entity: string) {
  return <IEntitySettings>settings().get(entity);
}

export function getEntitySetting(entity: string, settingName: string) {
  const entitySettings: any = settings().has(entity) ? settings().get(entity) : {};
  return entitySettings[settingName];
}

export function getEntityPrimaryKey(entity: string) {
  const primaryKey: string = getEntitySetting(entity, 'primaryKey');
  return primaryKey || 'id';
}


function settings() {
  return new Map<string, IEntitySettings>([

    [
      'persons',
      {
        targetField: 'last_name',
        semanticFields: ['last_name', 'first_name', 'middle_name',],
        shownColumnNames: ['last_name', 'first_name', 'middle_name'],
        conf: {filter: true},
      },
    ],
    [
      'users',
      {
        targetField: 'person',
        allColumns: [
          {field: 'username'},
          {field: 'person.last_name'},
          {field: 'person.first_name'},
          {field: 'person.middle_name'},
        ],
        shownColumnNames: ['person.last_name', 'person.first_name', 'person.middle_name'],
        includes: ['person'],
      },
    ],
  ]);
}
