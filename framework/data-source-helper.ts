import {buildDataSource, DataSource, Field} from '~/framework/data-source';
import {Presets} from '~/framework/presets';
import {IEntitySpec} from '~/framework/dbd/dbd-spec';
import {getEntityPrimaryKey} from '~/common/settings';
import {Includes} from '~/common/includes';

export function dataSourceHelper(tableName: string, primaryKeyValue?: any, presets?: Presets, includes?: Includes) {
  const root = getCurrentInstance().proxy;
  const domainModel = (root as any).$domainModel;
  let tableSpec: IEntitySpec;
  const dataSource = ref<DataSource>();
  const techFieldNames: string[] = [];

  onMounted(async () => {
    tableSpec = await domainModel.getEntitySpec(tableName);
    dataSource.value = await buildDataSource(tableSpec, primaryKeyValue, includes);
    if (presets) {
      presets.forEach((preset: any) => {
        dataSource.value!.fieldByName(preset.field).value = preset.value;
      });
    }
  });

  function fieldByName(fieldName: string): Field {
    return dataSource.value!.fieldByName(fieldName);
  }

  function getPrimaryKey(): any {
    const primaryKeyName = getEntityPrimaryKey(tableName);
    const primaryKeyField = dataSource.value!.fieldByName(primaryKeyName);
    return primaryKeyField.value ? primaryKeyField.value.asUnknown() : null;
  }

  const verboseName = computed(() => {
    return tableSpec.verboseName || '';
  });

  function setTechFields(fieldNames: string[]): void {
    for (const fieldName of fieldNames) {
      if (!techFieldNames.includes(fieldName)) {
        techFieldNames.push(fieldName);
      }
    }
  }

  const techFields = computed(() => {
    return dataSource.value!.fields.filter((field) => techFieldNames.includes(field.name));
  });

  const allFieldsExceptTechFields = computed(() => {
    return dataSource.value!.fields.filter((field) => !techFieldNames.includes(field.name));
  });

  return {dataSource, fieldByName, getPrimaryKey, verboseName, setTechFields, techFields, allFieldsExceptTechFields};
}

export function makeFieldsReadonly(dataSource: DataSource, fieldnames: string[], readOnly: boolean = true): void {
  dataSource.fields.forEach((field: Field) => {
    if (fieldnames.includes(field.name)) {
      field.readOnly = readOnly;
    }
  });
}

export function allFieldsReadOnly(dataSource: DataSource, readOnly: boolean = true): void {
    dataSource.fields.forEach((field: Field) => {
      field.readOnly = readOnly;
    })
}

export function makeFieldsRequired(dataSource: DataSource, fieldnames: string[], required: boolean = true): void {
  dataSource.fields.forEach((field: Field) => {
    if (fieldnames.includes(field.name)) {
      field.spec!.required = required;
    }
  });
}

export function disableOpenCard(dataSource: DataSource, fieldnames: string[]): void {
  dataSource.fields.forEach((field: Field) => {
    if (fieldnames.includes(field.name)) {
      if (field.extra) {
        Object.assign(field.extra, {disableOpenCard: true});
      } else {
        Object.assign(field, {extra: {disableOpenCard: true}});
      }
    }
  });
}

export function addToFieldExtra(field: Field, addExtra: any): void {
  if (field.extra) {
    Object.assign(field.extra, addExtra);
  } else {
    Object.assign(field, {extra: addExtra});
  }
}

export async function extractEntitySpec(root: any, tableName: string): Promise<IEntitySpec> {
  return await root.$domainModel.getEntitySpec(tableName);
}
