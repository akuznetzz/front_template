// eslint-disable-next-line import/named
import {Moment} from 'moment';
import {
  getModelByPrimaryKeyValueAndModelSpec,
  performPatchWithModelSpec,
  performPostWithModelSpec,
} from '~/common/drest-request';
import {Model} from '~/components/SmartTable/DRestResponse';
import {CheckedReadonlyMap, CheckedReadonlyMapImpl} from '~/common/CheckedReadonlyMap';
import {
  buildFieldValue,
  FieldValue,
  fieldValueFromArray,
  fieldValueFromBoolean,
  fieldValueFromDate,
  fieldValueFromDateTime,
  fieldValueFromTime,
  fieldValueFromNumber,
  fieldValueFromString,
  isSame,
} from '~/common/FieldValue';
import {
  dateTimeToIsoString,
  dateTimeWithoutTZToIsoString,
  dateToISOString,
  isoStringToDate,
  isoStringToDateTime,
  isoStringToTime,
  isoStringToDateTimeWithoutTZ,
  timeToISOString,
} from '~/common/date-conversion';
import {assert} from '~/common/assertions';
import {FieldSpec, IEntitySpec} from '~/framework/dbd/dbd-spec';
import {Includes} from '~/common/includes';

export interface Field {
  readonly changed: boolean;
  readonly name: string;
  readonly originalValue: FieldValue | undefined;
  readonly hasValue: boolean;
  spec: FieldSpec | undefined;
  refSpec: Ref<FieldSpec | undefined>;
  readOnly: boolean;
  refReadOnly: Ref<boolean>;
  value: FieldValue | undefined;
  refValue: Ref<FieldValue | undefined>;
  extra?: any;

  asString(): string;

  asNumber(): number;

  asDate(): Moment;

  asDateTime(): Moment;

  asTime(): Moment;

  asBoolean(): Boolean;

  asArray(): Array<any>;

  asUnknown(): unknown;
}

export interface DataSource {
  readonly entityName: string;
  readonly changed: boolean;
  readonly fields: ReadonlyArray<Field>;
  readOnly: boolean;
  refReadOnly: Ref<boolean>;

  clear(): void;

  reset(): void;

  validate(): boolean;

  setUp(primaryKeyValue: number | undefined): Promise<void>;

  save(): Promise<void>;

  fieldByName(name: string): Field;
}

class FieldImpl implements Field {
  dataSource: DataSource;
  refSpec = ref<FieldSpec>();
  refValue = ref<FieldValue>();
  originalValue: FieldValue | undefined;
  fldReadOnly: Ref<boolean>;
  refReadOnly = computed({
    get: () => this.fldReadOnly.value || this.dataSource.refReadOnly.value,
    set: (val) => {
      this.fldReadOnly.value = val;
    },
  });

  constructor(dataSource: DataSource, spec: FieldSpec) {
    this.dataSource = dataSource;
    this.refSpec.value = spec;
    this.fldReadOnly = ref(this.refSpec.value.read_only);
  }

  get name() {
    return this.refSpec.value ? this.refSpec.value.name : '';
  }

  get hasValue() {
    return !!this.refValue.value;
  }

  get spec() {
    return this.refSpec.value;
  }

  set spec(spec) {
    this.refSpec.value = spec;
    if (this.refSpec.value) {
      this.fldReadOnly = ref(this.refSpec.value.read_only);
    } else {
      this.fldReadOnly = ref(true);
    }
  }

  get value() {
    return this.refValue.value;
  }

  set value(value) {
    this.refValue.value = value;
  }

  get changed(): boolean {
    let result = true;
    if (this.originalValue && this.hasValue) {
      result = !isSame(this.originalValue, this.value!);
    } else if (!this.originalValue && !this.hasValue) {
      result = false;
    }
    return result;
  }

  get readOnly() {
    return this.refReadOnly.value;
  }

  set readOnly(val) {
    this.refReadOnly.value = val;
  }

  asString(): string {
    return this.refValue.value!.asString();
  }

  asNumber(): number {
    return this.refValue.value!.asNumber();
  }

  asDate(): Moment {
    return this.refValue.value!.asDate();
  }

  asDateTime(): Moment {
    return this.refValue.value!.asDateTime();
  }

  asTime(): Moment {
    return this.refValue.value!.asTime();
  }

  asBoolean(): Boolean {
    return this.refValue.value!.asBoolean();
  }

  asArray(): Array<any> {
    return this.refValue.value!.asArray();
  }

  asUnknown(): unknown {
    return this.refValue.value!.asUnknown();
  }
}

function drestValueFromFieldValue(fieldValue: FieldValue | undefined, type: string): unknown {
  if (fieldValue === undefined) {
    return type == 'many' ? [] : null;
  }
  let drestValue;
  switch (type) {
    case 'integer':
    case 'float':
    case 'one':
      drestValue = fieldValue.asNumber();
      break;
    case 'url':
    case 'email':
    case 'string':
    case 'file upload':
    case 'choice':
    case 'image upload':
    case 'file direct upload':
      drestValue = fieldValue.asString();
      break;
    case 'date':
      drestValue = dateToISOString(fieldValue.asDate());
      break;
    case 'datetime':
      drestValue = dateTimeToIsoString(fieldValue.asDateTime());
      break;
    case 'datetime without tz':
      drestValue = dateTimeWithoutTZToIsoString(fieldValue.asDateTime());
      break;
    case 'time':
      drestValue = timeToISOString(fieldValue.asTime());
      break;
    case 'boolean':
      drestValue = fieldValue.asBoolean();
      break;
    case 'decimal':
      drestValue = String(fieldValue.asNumber());
      break;
    case 'many':
    case 'multiple choice':
      drestValue = fieldValue.asArray();
      break;
    default:
      assert(false, `Conversion to DREST value of FieldValue with type=${type} is unsupported`);
  }
  return drestValue;
}

export function buildFieldValueFromDrestResponse(drestValue: unknown, type: string): FieldValue | undefined {
  if (drestValue === null || drestValue === undefined) {
    return;
  }
  let fieldValue;
  switch (type) {
    case 'integer':
    case 'float':
    case 'one':
      assert(typeof drestValue === 'number', 'buildFieldValueFromDrestResponse number');
      fieldValue = fieldValueFromNumber(drestValue);
      break;
    case 'url':
    case 'email':
    case 'string':
    case 'file upload':
    case 'file direct upload':
    case 'image upload':
      assert(typeof drestValue === 'string', 'buildFieldValueFromDrestResponse string');
      fieldValue = fieldValueFromString(drestValue);
      break;
    case 'choice':
      assert(['string', 'number'].includes(typeof drestValue), 'buildFieldValueFromDrestResponse choice');
      fieldValue = fieldValueFromString(String(drestValue));
      break;
    case 'date':
      assert(typeof drestValue === 'string', 'buildFieldValueFromDrestResponse date');
      fieldValue = fieldValueFromDate(isoStringToDate(drestValue));
      break;
    case 'datetime':
      assert(typeof drestValue === 'string', 'buildFieldValueFromDrestResponse datetime');
      fieldValue = fieldValueFromDateTime(isoStringToDateTime(String(drestValue)));
      break;
    case 'datetime without tz':
      assert(typeof drestValue === 'string', 'buildFieldValueFromDrestResponse datetime');
      fieldValue = fieldValueFromDateTime(isoStringToDateTimeWithoutTZ(drestValue));
      break;
    case 'time':
      assert(typeof drestValue === 'string', 'buildFieldValueFromDrestResponse time');
      fieldValue = fieldValueFromTime(isoStringToTime(String(drestValue)));
      break;
    case 'boolean':
      assert(typeof drestValue === 'boolean', 'buildFieldValueFromDrestResponse boolean');
      fieldValue = fieldValueFromBoolean(drestValue);
      break;
    case 'decimal':
      assert(typeof drestValue === 'string', 'buildFieldValueFromDrestResponse decimal');
      fieldValue = fieldValueFromNumber(Number(drestValue));
      break;
    case 'many':
    case 'multiple choice':
      assert(Array.isArray(drestValue), 'buildFieldValueFromDrestResponse array');
      fieldValue = fieldValueFromArray(drestValue);
      break;
    case 'field':
      fieldValue = fieldValueFromString(String(drestValue));
      break;
    default:
    // fixme: uncomment and support all types and values
    // assert(false, () => `Type "${type}" of DREST value "${drestValue}" is unsupported`);
  }
  return fieldValue;
}

export function fieldsAsObject(fields: ReadonlyArray<Field>) {
  const object: any = {};
  for (const field of fields) {
    object[field.name] = field.spec ? drestValueFromFieldValue(field.value, field.spec.type) : null;
  }
  return object;
}

class DataSourceImpl implements DataSource {
  readonly modelSpec: IEntitySpec;
  readonly fieldsMap: CheckedReadonlyMap<string, FieldImpl>;
  readonly fields: ReadonlyArray<FieldImpl>;
  refReadOnly = ref<boolean>(false);

  constructor(modelSpec: IEntitySpec) {
    this.modelSpec = modelSpec;
    this.fieldsMap = new CheckedReadonlyMapImpl(
      Array.from(modelSpec.fieldSpecs.entries()).map(([name, fieldSpec]) => [name, new FieldImpl(this, fieldSpec)]),
    );
    this.fields = Array.from(this.fieldsMap.values());
    markRaw(this);
  }

  get entityName() {
    return this.modelSpec.resource_name_plural || '';
  }

  get changed() {
    return this.fields.some((field) => field.changed);
  }

  get readOnly() {
    return this.refReadOnly.value!;
  }

  set readOnly(val: boolean) {
    this.refReadOnly.value = val;
  }

  clear(): void {
    for (const field of this.fields) {
      field.value = undefined;
      field.originalValue = undefined;
    }
  }

  reset(): void {
    for (const field of this.fields) {
      field.value = field.originalValue;
    }
  }

  async save() {
    const primaryKeyValue = this.fieldsMap.checkedGet(this.modelSpec.primaryKey).value;
    let model;
    if (primaryKeyValue) {
      model = await performPatchWithModelSpec(
        this.modelSpec,
        primaryKeyValue.asNumber(),
        this.getChangedFieldsAsObject(),
      );
    } else {
      model = await performPostWithModelSpec(this.modelSpec, this.getFieldsAsObject());
    }
    this.initFromModel(model);
  }

  validate(): boolean {
    return true;
  }

  async fetchData(primaryKeyValue: number, includes?: Includes): Promise<Model> {
    return await getModelByPrimaryKeyValueAndModelSpec(this.modelSpec, primaryKeyValue, includes);
  }

  async setUp(primaryKeyValue: number | undefined, includes?: Includes) {
    if (primaryKeyValue) {
      const model = await this.fetchData(primaryKeyValue, includes);
      this.initFromModel(model);
    } else {
      this.clear();
    }
  }

  fieldByName(name: string): Field {
    return this.fieldsMap.checkedGet(name);
  }

  private getChangedFieldsAsObject() {
    return fieldsAsObject(this.fields.filter((field) => field.changed));
  }

  private getFieldsAsObject() {
    return fieldsAsObject(this.fields);
  }

  private initFromModel(model: Model) {
    for (const field of this.fields) {
      if (field.spec) {
        const fieldValue = buildFieldValueFromDrestResponse(model[field.name], field.spec.type);
        field.value = fieldValue;
        field.originalValue = fieldValue;
      }
    }
  }
}

export async function buildDataSource(
  modelSpec: IEntitySpec,
  primaryKeyValue?: number,
  includes?: Includes,
): Promise<DataSource> {
  const dataSource = new DataSourceImpl(modelSpec);
  if (primaryKeyValue) {
    await dataSource.setUp(primaryKeyValue, includes);
  }
  return dataSource;
}

export function assignDataSource(source: DataSource, destination: DataSource): void {
  destination.clear();
  for (const destField of destination.fields) {
    const srcField = source.fieldByName(destField.name);
    if (srcField && srcField.value) {
      destField.value = buildFieldValue(srcField.value.asUnknown(), srcField.value.type);
    }
  }
}
