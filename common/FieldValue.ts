// eslint-disable-next-line import/named
import {Moment} from 'moment';
import {dateTimeToIsoString, dateToISOString, timeToISOString} from '~/common/date-conversion';
import {assert} from '~/common/assertions';

export interface FieldValue {
  readonly type: FieldType;
  asString(): string;
  asNumber(): number;
  asDate(): Moment;
  asDateTime(): Moment;
  asTime(): Moment;
  asBoolean(): Boolean;
  asArray(): Array<any>;
  asUnknown(): unknown;
}

export enum FieldType {
  String,
  Number,
  Boolean,
  Date,
  DateTime,
  Array,
  Time,
  // todo: support other types
}

export function buildFieldValue(value: unknown, type: FieldType): FieldValue {
  return new FieldValueImpl(value, type);
}

export function fieldValueFromNumber(value: number): FieldValue {
  return buildFieldValue(value, FieldType.Number);
}

export function fieldValueFromString(value: string): FieldValue {
  return buildFieldValue(value, FieldType.String);
}

export function fieldValueFromBoolean(value: boolean) {
  return buildFieldValue(value, FieldType.Boolean);
}

export function fieldValueFromDate(value: Moment) {
  return buildFieldValue(value, FieldType.Date);
}

export function fieldValueFromDateTime(value: Moment) {
  return buildFieldValue(value, FieldType.DateTime);
}

export function fieldValueFromTime(value: Moment) {
  return buildFieldValue(value, FieldType.Time);
}

export function fieldValueFromArray(value: Array<any>): FieldValue {
  return buildFieldValue(value, FieldType.Array);
}

class FieldValueImpl implements FieldValue {
  private readonly rawValue: unknown;
  readonly type: FieldType;

  constructor(rawValue: any, type: FieldType) {
    this.rawValue = rawValue;
    this.type = type;
  }

  asString(): string {
    let result;
    switch (this.type) {
      case FieldType.String:
        result = String(this.rawValue);
        break;
      case FieldType.Number:
        result = String(this.rawValue);
        break;
      case FieldType.Boolean:
        result = String(this.rawValue);
        break;
      case FieldType.Date:
        result = dateToISOString(this.rawValue as Moment);
        break;
      case FieldType.DateTime:
        result = dateTimeToIsoString(this.rawValue as Moment);
        break;
      case FieldType.Time:
        result = timeToISOString(this.rawValue as Moment);
        break;
      case FieldType.Array:
        result = JSON.stringify(this.rawValue);
        break;
    }
    return result;
  }

  asNumber(): number {
    assert(this.type === FieldType.Number, 'FieldValue.asNumber');
    return Number(this.rawValue);
  }

  asUnknown(): unknown {
    return this.rawValue;
  }

  asDateTime(): Moment {
    assert(this.type === FieldType.DateTime, 'FieldValue.asDateTime');
    return this.rawValue as Moment;
  }

  asDate(): Moment {
    // todo: uncomment this when there will be datetime input control
    // assert(this.type === FieldType.Date, 'FieldValue.asDate');
    assert(this.type === FieldType.Date || this.type === FieldType.DateTime, 'FieldValue.asDate');
    return this.rawValue as Moment;
  }

  asTime(): Moment {
    assert(this.type === FieldType.Time, 'FieldValue.asTime');
    return this.rawValue as Moment;
  }

  asBoolean(): Boolean {
    return Boolean(this.rawValue);
  }

  asArray(): Array<any> {
    return this.rawValue as Array<any>;
  }
}

export function isSame(fieldValue1: FieldValue, fieldValue2: FieldValue): boolean {
  return (
    fieldValue1.type === fieldValue2.type &&
    (fieldValue1.type === FieldType.Array
      ? fieldValue1.asString() === fieldValue2.asString()
      : fieldValue1.asUnknown() === fieldValue2.asUnknown())
  );
}

export function asStringOrNull(fieldValue: FieldValue | undefined | null): string | null {
  return fieldValue ? fieldValue.asString() : null;
}

export function asNumberOrNull(fieldValue: FieldValue | undefined | null): number | null {
  return fieldValue ? fieldValue.asNumber() : null;
}

export function asUnknownOrNull(fieldValue: FieldValue | undefined | null): unknown | null {
  return fieldValue ? fieldValue.asUnknown() : null;
}

export function asDateTimeOrNull(fieldValue: FieldValue | undefined | null): Moment | null {
  return fieldValue ? fieldValue.asDateTime() : null;
}

export function asDateOrNull(fieldValue: FieldValue | undefined | null): Moment | null {
  return fieldValue ? fieldValue.asDate() : null;
}

export function asBooleanOrNull(fieldValue: FieldValue | undefined | null): Boolean | null {
  return fieldValue ? fieldValue.asBoolean() : null;
}

export function asArrayOrNull(fieldValue: FieldValue | undefined | null): Array<any> | null {
  return fieldValue ? fieldValue.asArray() : null;
}
