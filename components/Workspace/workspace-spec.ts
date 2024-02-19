export interface IEditCardField {
  name: string; // имя поля
  value: any; // значение поля
  options: any; // объедененные свойства IEntitySettings.fieldsSpecs + IFieldSpec.options.properties для поля
  validate?: (field: IEditCardField, value: any) => void;
}

export interface IInputControllerComponent {
  name: string;
  props: any; // множество свойств, в основном (vuetify компонентов)
}

// свойства необходимые для определения типа контроллера
export interface IInputControllerSpec {
  type?: string;
  required?: boolean;
  label?: string;
  controlName?: string;
  radioRowMode?: boolean;
  read_only?: boolean;
  rules?: any;
}
// свойства возвращенные getEntitySettings(apiModel)
export interface IEntitySettings {
  verboseName?: string;
  verboseNamePlural?: string;
  semanticFields?: string[];
  targetField?: string;
  allColumns?: any[];
  includes?: string[];
  shownColumnNames?: string[];
  conf?: Object;
  groups?: any[];
  fieldsSpecs?: Map<string, IInputControllerSpec>;
}
