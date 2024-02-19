export const getExecuteComponentNameAppEventId = Symbol('getExecuteComponentNameAppEventId');
export const getExecuteComponentNameEventId = Symbol('getExecuteComponentNameEventId');
export const getExecuteComponentPropsAppEventId = Symbol('getExecuteComponentPropsAppEventId');

export interface GetExecuteComponentNameParameters {
  readonly tableName: string;
  readonly contextId?: string;
  readonly primaryKeyValue?: number;
  readonly props?: any;
  componentName?: string;
}

export interface GetExecuteComponentPropsParameters {
  readonly tableName: string;
  readonly contextId?: string;
  readonly primaryKeyValue?: number;
  readonly props?: any;
  readonly componentName?: string;
  componentProps?: any;
}
