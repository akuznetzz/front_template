export enum ModalResult {
  Accepted,
  Denied,
}

// Результат, возвращаемый вызываемым компонентом
export interface IDynamicComponentResult {
  modalResult: ModalResult;
  payload?: any;
}

// Компонент добавляемый в контекст Workspace
export interface IDynamicComponent {
  name: string; // название компонента
  props?: any;
  onContextClose?: (result: IDynamicComponentResult) => void; // функция выполняемая при закрытии контекста
}

export interface IWorkspaceContext {
  uuid: number; // context uuid
  parent?: string; // parent context uuid
  title: string; // context title for navigation
  path: string; // context path
  active: boolean; // is context active?
  dynamicComponent: IDynamicComponent;
}

export interface IWorkspaceManager {
  clearContext(): void;
  addContext(context: IWorkspaceContext): void;
  removeContext(context: IWorkspaceContext): void;
  executeContext(context: IWorkspaceContext): void;
  executeDynamicComponent(dynamicComponent: IDynamicComponent, contextTitle?: string): Promise<any>;
  closeContext({context, result}: {context: IWorkspaceContext; result: IDynamicComponentResult}): void;
  getPathContexts(path: string): IWorkspaceContext[];
  closeAllContextsOfPath(path: string): void;
}
