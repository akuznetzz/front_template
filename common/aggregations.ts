export const ALLOWED_FIELD_TYPES = ['integer', 'float', 'decimal'];

export enum AggregationType {
  Sum = 1,
  Avg = 2,
  Max = 3,
  Min = 4,
}

export function AggregationTypeNames() {
  return {
    [AggregationType.Avg]: window.$nuxt.$tc('smartTable.aggregation.avg'),
    [AggregationType.Max]: window.$nuxt.$tc('smartTable.aggregation.max'),
    [AggregationType.Min]: window.$nuxt.$tc('smartTable.aggregation.min'),
    [AggregationType.Sum]: window.$nuxt.$tc('smartTable.aggregation.sum'),
  };
}

export interface Aggregation {
  field: string;
  kind: AggregationType;
}

export type Aggregations = Array<Aggregation>;

function aggregationTypeToDRestType(kind: AggregationType): string {
  switch (kind) {
    case AggregationType.Avg:
      return 'avg';
    case AggregationType.Max:
      return 'max';
    case AggregationType.Min:
      return 'min';
    case AggregationType.Sum:
      return 'sum';
  }
}

export function aggregationToDRestUrlString(aggregation: Aggregation): string {
  const dRestType = aggregationTypeToDRestType(aggregation.kind);
  return `agg{${aggregation.field}}=${dRestType}`;
}

export function aggregationsToDRestUrlString(aggregations: Aggregations): string {
  return aggregations.map(aggregationToDRestUrlString).join('&');
}

export type AggregationsData = Map<string, number>;
