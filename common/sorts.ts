export enum SortDirection {
  Ascending,
  Descending,
}

export interface Sort {
  field: string;
  direction: SortDirection;
}

export type Sorts = Sort[];

export function sortsToDRestUrlString(sorts: Sorts): string {
  return sorts.map((sort) => `sort[]=${sort.direction === SortDirection.Descending ? '-' : ''}${sort.field}`).join('&');
}
