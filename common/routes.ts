import {CheckedReadonlyMap, CheckedReadonlyMapImpl} from '~/common/CheckedReadonlyMap';
import {assert} from '~/common/assertions';

export interface RouteItem {
  readonly path: string;
  readonly title: string;
  readonly group?: boolean;
  readonly parent?: string;
}

const START_ROUTE_ITEMS = [
  {name: 'index', body: {path: '/', title: 'Главная страница'}},
  {name: 'login', body: {path: '/login', title: 'Вход'}},
] as const;

const COMMON_ROUTE_NAMES = [
  'login',
  'index',
  'persons',
] as const;



const ROUTE_NAMES = [
  ...START_ROUTE_ITEMS.map((item: any) => item.name),
  ...COMMON_ROUTE_NAMES,
] as const;

type RouteNamesTuple = typeof ROUTE_NAMES;
type RouteNames = RouteNamesTuple[number];

export function ROUTES(): CheckedReadonlyMap<RouteNames, RouteItem> {
  return new CheckedReadonlyMapImpl([
    ['login', {path: '/login', title: 'Вход'}],
    ['index', {path: '/', title: 'Главная страница'}],
    ['persons', {path: '/persons', title: 'Физические лица'}],
    ['admin', {path: '/admin', title: 'Режим администратора', group: true}],
    ['admin-base-tables', {path: '/admin/admin-base-tables', title: 'Администрирование таблиц', parent: 'admin'}],
  ]);
}

export function isRouteName(value: string): boolean {
  // @ts-ignore string and route names are incompatible
  return ROUTE_NAMES.includes(value);
}

export function assertIsRouteName(value: string): asserts value is RouteNames {
  assert(isRouteName(value));
}
