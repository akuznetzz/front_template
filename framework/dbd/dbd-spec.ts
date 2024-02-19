/* eslint no-use-before-define: "off" */

export interface IDomainModel {
  apiUrl: string;
  getEntitySpec(entityName: string): Promise<IEntitySpec>;
  getEntitiesList(): any;
}

export interface IEntitySpec {
  url: string;
  name: string;
  resource_name: string;
  resource_name_plural: string;
  verboseName?: string;
  verboseNamePlural?: string;
  primaryKey: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  fieldSpecs: Map<string, FieldSpec>;
  domainModel: IDomainModel;
  readonly options?: IEntitySpecOptions;
  getFieldSpec(fieldName: string): FieldSpec;
  getFieldSpecList(): any;
}

export interface FieldSpec {
  name: string;
  type: string;
  label: string;
  nullable?: boolean;
  related_to?: string;
  read_only: boolean;
  required: boolean;
  decimal_places?: number;
  upload_to?: string;
  entitySpec: IEntitySpec;
  choices?: object[];
}
// fixme: this is part of EntitySpec. FieldSpecs are in properties array.
export interface IEntitySpecOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  features: string[];
  resource_name: string;
  resource_name_plural: string;
  content_type_id: number;
  /**
   * @deprecated use IEntitySpec.fieldSpecs instead
   */
  properties: {[index: string]: any};
}
