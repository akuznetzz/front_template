import {assert} from '~/common/assertions';
import {FieldSpec, IEntitySpec, IDomainModel, IEntitySpecOptions} from '~/framework/dbd/dbd-spec';

export class FieldSpecImpl implements FieldSpec {
  name = '';
  type = '';
  label = '';
  related_to = '';
  read_only = false;
  required = false;
  decimal_places = 0;
  entitySpec: IEntitySpec;

  constructor(fieldName: string, tableSpec: IEntitySpec) {
    this.name = fieldName;
    this.entitySpec = tableSpec;
  }
}

export class TableSpecImpl implements IEntitySpec {
  url = '';
  name = '';
  resource_name = '';
  resource_name_plural = '';
  verboseName? = '';
  verboseNamePlural? = '';
  primaryKey = 'id'; // todo: retrieve the primary key from the backend
  canAdd = false;
  canEdit = false;
  canDelete = false;
  fieldSpecs = new Map<string, FieldSpec>();
  domainModel: IDomainModel;
  options?: IEntitySpecOptions;

  constructor(tableName: string, dataSpec: IDomainModel) {
    this.name = tableName;
    this.domainModel = dataSpec;
  }

  getFieldSpec(fieldName: string): FieldSpec {
    assert(
      this.fieldSpecs.has(fieldName),
      `DomainModel: Field named "${fieldName}" not found in table "${this.name}"!`,
    );
    return this.fieldSpecs.get(fieldName)!;
  }

  getFieldSpecList(): any {
    return this.fieldSpecs.values();
  }

  addFieldSpecImpl(fieldSpecImpl: FieldSpecImpl): void {
    this.fieldSpecs.set(fieldSpecImpl.name, fieldSpecImpl);
  }
}

export function createFieldSpecImpl(fieldName: string, tableSpec: IEntitySpec): FieldSpecImpl {
  return new FieldSpecImpl(fieldName, tableSpec);
}

export function createTableSpecImpl(tableName: string, dataSpec: IDomainModel): TableSpecImpl {
  return new TableSpecImpl(tableName, dataSpec);
}

export class EntitySpecOptionsImpl implements IEntitySpecOptions {
  name = '';
  description = '';
  renders = [];
  parses = [];
  features = [];
  resource_name = '';
  resource_name_plural = '';
  content_type_id = 0;
  properties = {};
}
