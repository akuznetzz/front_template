import {InjectionKey, ref} from 'vue';

import {
  IWorkspaceManager,
  IWorkspaceContext,
  IDynamicComponent,
  IDynamicComponentResult,
} from '~/framework/workspace-manager/workspace-manager-spec';
import {IDomainModel, IEntitySpec} from '~/framework/dbd/dbd-spec';
import {getEntitySettings} from '~/common/settings';

export const workspaceManagerInjectionKey: InjectionKey<IWorkspaceManager> = Symbol('WorkspaceManager');

export function initWorkspaceManager(router: any, domainModel: IDomainModel): IWorkspaceManager {
  return new WorkspaceManager(router, domainModel);
}

export interface IWorkspaceComponent extends IDynamicComponent {
  closeContext?(): any; // функция закрывающая контекст
}

class WorkspaceComponent implements IWorkspaceComponent {
  name: string; // название компонента
  props?: any;
  onContextClose?: (result: IDynamicComponentResult) => void; // функция выполняемая при закрытии контекста
  closeContext?(): any; // функция закрывающая контекст

  constructor(dynamicComponent: IDynamicComponent) {
    this.name = dynamicComponent.name;
    this.props = dynamicComponent.props;
    this.onContextClose = dynamicComponent.onContextClose;
  }
}

class WorkspaceManager implements IWorkspaceManager {
  router: any;
  domainModel: IDomainModel;
  contexts = ref<IWorkspaceContext[]>([]);

  constructor(router: any, domainModel: IDomainModel) {
    this.router = router;
    this.domainModel = domainModel;
  }

  clearContext(): void {
    this.contexts.value = [];
  }

  addContext(context: IWorkspaceContext): void {
    const path = this.router.currentRoute.path;
    context.parent = this.getActiveContextUuidByPath(path);
    context.path = path;
    this.contexts.value = [...this.contexts.value, context];
  }

  removeContext(context: IWorkspaceContext): void {
    this.contexts.value = this.contexts.value.filter((item: IWorkspaceContext) => item.uuid !== context.uuid);
  }

  async closeContext({context, result}: {context: IWorkspaceContext; result: IDynamicComponentResult}) {
    const parentContext = this.getContextByUuid(context.parent!);
    if (parentContext) {
      // делаем активным родительский контекст
      this.makeContextActive(parentContext);
    }
    // вызываем метод при закрытии контекста
    if (context.dynamicComponent && !!context.dynamicComponent.onContextClose) {
      await context.dynamicComponent.onContextClose(result);
    }
    // удаляем контекст
    this.removeContext(context);
  }

  async executeDynamicComponent(dynamicComponent: IDynamicComponent, contextTitle?: string) {
    const workspaceComponent = new WorkspaceComponent(dynamicComponent);
    workspaceComponent.closeContext = async () => {
      await this.closeContext;
    };
    const newContext = new WorkspaceContext(workspaceComponent, contextTitle);
    await newContext.tuneUpContext(this.domainModel);

    return new Promise((resolve) => {
      if (!newContext.dynamicComponent.onContextClose) {
        newContext.dynamicComponent.onContextClose = (result: IDynamicComponentResult) => {
          resolve(result);
        };
      }
      this.executeContext(newContext);
    });
  }

  executeContext(context: IWorkspaceContext): void {
    this.addContext(context);
    this.makeContextActive(context);
  }

  makeContext(): WorkspaceContext | undefined {
    return undefined;
  }

  makeContextActive(context: IWorkspaceContext): void {
    this.contexts.value.forEach((item: IWorkspaceContext) => {
      if (item.path === context.path) {
        item.active = item.uuid === context.uuid;
      }
    });
  }

  getActiveContextUuidByPath(path: string): string {
    const activeContext: any = this.contexts.value.find((item: any) => item.path === path && item.active === true);
    return activeContext ? activeContext.uuid : 'root';
  }

  getContextByUuid(uuid: string): IWorkspaceContext | undefined {
    return this.contexts.value.find((item: any) => item.uuid === uuid);
  }

  getPathContexts(path: string): IWorkspaceContext[] {
    return this.contexts.value.filter((item: IWorkspaceContext) => item.path === path);
  }

  closeAllContextsOfPath(path: string): void {
    // закрывает все конткесты рабочей области кроме корневого
    this.contexts.value = this.contexts.value.filter((item: IWorkspaceContext) => {
      return item.path !== path;
    });
  }
}

class WorkspaceContext implements IWorkspaceContext {
  uuid = 0; // context uuid
  title = ''; // context title for navigation
  path = ''; // context path
  active = false; // is context active?
  dynamicComponent: IDynamicComponent;

  constructor(dynamicComponent: IDynamicComponent, contextTitle: string = '') {
    this.uuid = Date.now();
    this.title = contextTitle;
    this.dynamicComponent = dynamicComponent;
  }

  async tuneUpContext(domainModel: IDomainModel) {
    if (this.dynamicComponent.props.apiModel) {
      const entitySpec: IEntitySpec = await domainModel.getEntitySpec(this.dynamicComponent.props.apiModel);
      const entitySettings = getEntitySettings(this.dynamicComponent.props.apiModel);
      const apiModelSettings = {
        verboseName: entitySpec.verboseName,
        verboseNamePlural: entitySpec.verboseNamePlural,
        ...entitySettings,
      };
      this.dynamicComponent.props.apiModelSettings = apiModelSettings;
      if (!this.title) {
        if (this.dynamicComponent.props.primaryKeyValue && apiModelSettings.verboseName) {
          this.title = `${apiModelSettings.verboseName}: ${this.dynamicComponent.props.primaryKeyValue}`;
        } else if (apiModelSettings.verboseNamePlural) {
          this.title = apiModelSettings.verboseNamePlural;
        }
      }
    }
    return this;
  }
}
