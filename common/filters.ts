/* eslint no-use-before-define: "off" */

import {FieldValue} from '~/common/FieldValue';

export enum Condition {
  Equals,
  NotEquals,
  ContainsIgnoreCase,
  LesserThan,
  LesserOrEquals,
  GreaterThan,
  GreaterOrEquals,
}

export type Filter = SimpleFilter | IsNullFilter | IsNotNullFilter | RangeFilter | InFilter | NotInFilter | RawFilter;

interface AbstractFilter {
  field: string;
}

export interface SimpleFilter extends AbstractFilter {
  kind: 'simple';
  condition: Condition;
  value: FieldValue;
}

export function buildSimpleFilter(field: string, condition: Condition, value: FieldValue): SimpleFilter {
  return {kind: 'simple', field, condition, value};
}

export interface IsNullFilter extends AbstractFilter {
  kind: 'isNull';
}

export function buildIsNullFilter(field: string): IsNullFilter {
  return {kind: 'isNull', field};
}

export interface IsNotNullFilter extends AbstractFilter {
  kind: 'isNotNull';
}

export function buildIsNotNullFilter(field: string): IsNotNullFilter {
  return {kind: 'isNotNull', field};
}

export interface RangeFilter extends AbstractFilter {
  kind: 'range';
  leftValue: FieldValue;
  rightValue: FieldValue;
}

export function buildRangeFilter(field: string, leftValue: FieldValue, rightValue: FieldValue): RangeFilter {
  return {kind: 'range', field, leftValue, rightValue};
}

interface AbstractInFilter extends AbstractFilter {
  values: ReadonlyArray<FieldValue>;
}

export interface InFilter extends AbstractInFilter {
  kind: 'in';
}
export interface NotInFilter extends AbstractInFilter {
  kind: 'notIn';
}

export interface RawFilter extends AbstractFilter {
  kind: 'raw';
  value: FieldValue;
}

export function buildRawFilter(field: string, value: FieldValue): RawFilter {
  return {kind: 'raw', field, value};
}

export function buildInFilter(field: string, values: ReadonlyArray<FieldValue>): InFilter {
  return {kind: 'in', field, values};
}

export function buildNotInFilter(field: string, values: ReadonlyArray<FieldValue>): NotInFilter {
  return {kind: 'notIn', field, values};
}

export type Filters = Array<Filter>;

function filterConditionToDRestCondition(condition: Condition): string {
  switch (condition) {
    case Condition.Equals:
    case Condition.NotEquals:
      return '';
    case Condition.ContainsIgnoreCase:
      return 'icontains';
    case Condition.LesserThan:
      return 'lt';
    case Condition.LesserOrEquals:
      return 'lte';
    case Condition.GreaterThan:
      return 'gt';
    case Condition.GreaterOrEquals:
      return 'gte';
  }
}

function fieldValueToDRestString(value: FieldValue) {
  return value.asString();
}

export function filterToDRestUrlString(filter: Filter): string {
  switch (filter.kind) {
    case 'simple': {
      let dRestCondition = filterConditionToDRestCondition(filter.condition);
      if (dRestCondition) {
        dRestCondition = '.' + dRestCondition;
      }
      const not = filter.condition === Condition.NotEquals ? '-' : '';
      return `filter{${not}${filter.field}${dRestCondition}}=${fieldValueToDRestString(filter.value)}`;
    }
    case 'isNull':
      return `filter{${filter.field}.isnull}=true`;
    case 'isNotNull':
      return `filter{${filter.field}.isnull}=false`;
    case 'range':
      return `filter{${filter.field}.range}[]=${fieldValueToDRestString(filter.leftValue)}&filter{${
        filter.field
      }.range}[]=${fieldValueToDRestString(filter.rightValue)}`;
    case 'in':
    case 'notIn': {
      const not = filter.kind == 'notIn' ? '-' : '';
      return filter.values
        .map((value) => `filter{${not}${filter.field}.in}=${fieldValueToDRestString(value)}`)
        .join('&');
    }
    case 'raw':
      return `${filter.field}=${fieldValueToDRestString(filter.value)}`;
  }
}

export function filtersToDRestUrlString(filters: Filters): string {
  return filters.map(filterToDRestUrlString).join('&');
}
