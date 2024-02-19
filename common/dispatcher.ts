import {CheckedReadonlyMapImpl} from '~/common/CheckedReadonlyMap';

export const contentTypeModelsMap = new CheckedReadonlyMapImpl([
  ['person', 'физическое лицо'],
]);

export const contentTypeToApiModelMap = new CheckedReadonlyMapImpl([
  ['person', 'persons'],
]);
