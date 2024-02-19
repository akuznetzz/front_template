import {IDomainModel, IEntitySpec} from '~/framework/dbd/dbd-spec';
import {SortDirection} from '~/common/sorts';
import {
  getBaseViewSettings,
  getTableViewSettings,
  TableViewProps,
  ShowFieldProps,
  SortFieldProps,
  BaseViewField,
  BaseViewFields,
} from '~/components/AdminBaseTable/base-table-view';
import {loadTableSettings} from '~/components/SmartTable/store';
import {BaseFieldNode, BaseFieldNodesList} from '~/components/AdminBaseTable/BaseViewFields/base-fields-helper';
import {getViewAvailableFields} from '~/components/SmartTable/smart-table-helper';
import {assert} from '~/common/assertions';

export type ViewFieldNodesList = Array<ViewFieldNode>;

export type ViewFieldNode = {
  id: any;
  path: string;
  path_title: string;
  name: string;
  title?: string;
  fieldName: string;
  fieldType: string;
  selected?: boolean;
  related_to?: string;
  children?: ViewFieldNodesList;
  parentOnly?: boolean;
  sortDirection?: SortDirection;
  filter?: string;
  nodeKind?: string;
};

export const IDFieldNode: ViewFieldNode = {
  id: 1,
  path: 'id',
  path_title: 'ID',
  name: 'ID',
  fieldName: 'id',
  fieldType: 'number',
};

export class TreeIdCounter {
  lastNodeId: number;

  constructor(startNodeId: number = 0) {
    this.lastNodeId = startNodeId;
  }

  getNodeId(): number {
    this.lastNodeId += 1;
    return this.lastNodeId;
  }
}

async function getFieldTitle(tableSpec: IEntitySpec, fieldNameSplit: string[]): Promise<string | undefined> {
  assert(fieldNameSplit.length > 0);
  if (fieldNameSplit.length === 1) {
    return tableSpec.fieldSpecs.has(fieldNameSplit[0]) ? tableSpec.getFieldSpec(fieldNameSplit[0]).label : undefined;
  }
  if (!tableSpec.fieldSpecs.has(fieldNameSplit[0])) {
    return undefined;
  }
  const fieldNameSpec = tableSpec.getFieldSpec(fieldNameSplit[0]);
  if ((fieldNameSpec.type !== 'one' && fieldNameSpec.type !== 'many') || !fieldNameSpec.related_to) {
    return undefined;
  }
  return await getFieldTitle(
    await tableSpec.domainModel.getEntitySpec(fieldNameSpec.related_to),
    fieldNameSplit.slice(1),
  );
}

export class ViewTableFieldsTreeMaker {
  readonly domainModel: IDomainModel;
  readonly tableSpec: IEntitySpec;
  readonly treeIdCounter: TreeIdCounter;
  readonly parentNode?: ViewFieldNode;
  readonly reMakeTree: boolean;
  treeNodes: ViewFieldNodesList;
  openNodes: ViewFieldNodesList;
  shownNodes: ViewFieldNodesList;
  sortedNodes: ViewFieldNodesList;

  constructor(
    domainModel: IDomainModel,
    tableSpec: IEntitySpec,
    treeIdCounter?: TreeIdCounter,
    parentNode?: ViewFieldNode,
    reMakeTree: boolean = false,
  ) {
    this.domainModel = domainModel;
    this.tableSpec = tableSpec;
    this.treeIdCounter = treeIdCounter ?? new TreeIdCounter();
    this.parentNode = parentNode;
    this.reMakeTree = reMakeTree;
    this.treeNodes = [];
    this.openNodes = [];
    this.shownNodes = [];
    this.sortedNodes = [];
  }

  async makeFieldsTree(availableFieldsList?: BaseViewFields, tableViewProps: TableViewProps = {}) {
    if (!availableFieldsList) {
      this.treeNodes = [];
      return this.treeNodes;
    }
    const showFieldList = tableViewProps.columns || [];
    const sortFieldList = tableViewProps.sorts || [];
    const pathPrefix = this.parentNode ? `${this.parentNode.path}.` : '';
    this.treeNodes = await Promise.all(
      Array.from(this.tableSpec.fieldSpecs.entries())
        .filter(([_name, fieldSpec]) => {
          return availableFieldsList.find(
            (availableField: BaseViewField) =>
              availableField.kind !== 'manual' &&
              (availableField.field === `${pathPrefix}${fieldSpec.name}` ||
                (fieldSpec.type === 'one' && availableField.field.indexOf(`${pathPrefix}${fieldSpec.name}.`) === 0)),
          );
        })
        .map(async ([_name, fieldSpec]) => {
          const fieldNode: ViewFieldNode = {
            id: this.treeIdCounter.getNodeId(),
            path: this.parentNode ? `${this.parentNode.path}.${fieldSpec.name}` : fieldSpec.name,
            path_title: this.parentNode ? `${this.parentNode.path_title} -> ${fieldSpec.label}` : fieldSpec.label,
            name: fieldSpec.label,
            fieldName: fieldSpec.name,
            fieldType: fieldSpec.type,
          };

          const availField = availableFieldsList.find(
            (availableField: BaseViewField) => availableField.field === `${pathPrefix}${fieldSpec.name}`,
          );
          if (availField && availField.title) {
            fieldNode.title = availField.title;
          }

          if (showFieldList.find((showField: ShowFieldProps) => showField.field === fieldNode.path)) {
            fieldNode.selected = true;
            this.shownNodes.push(fieldNode);
          }
          const sortField = sortFieldList.find((sortItem: SortFieldProps) => sortItem.field === fieldNode.path);
          if (sortField) {
            fieldNode.sortDirection = sortField.order;
            this.sortedNodes.push(fieldNode);
          }

          if (
            fieldSpec.type === 'one' &&
            availableFieldsList.find(
              (availableField: BaseViewField) => availableField.field.indexOf(`${pathPrefix}${fieldSpec.name}.`) === 0,
            )
          ) {
            fieldNode.related_to = fieldSpec.related_to;
            const childrenMaker = new ViewTableFieldsTreeMaker(
              this.domainModel,
              await this.domainModel.getEntitySpec(fieldSpec.related_to!),
              this.treeIdCounter,
              fieldNode,
              this.reMakeTree,
            );
            await childrenMaker.makeFieldsTree(availableFieldsList, tableViewProps);
            fieldNode.children = childrenMaker.treeNodes;
            if (!availableFieldsList.find((availableField: BaseViewField) => availableField.field === fieldNode.path)) {
              fieldNode.parentOnly = true;
            }
            this.shownNodes = [...this.shownNodes, ...childrenMaker.shownNodes];
            this.sortedNodes = [...this.sortedNodes, ...childrenMaker.sortedNodes];
          }

          return fieldNode;
        }),
    );

    if (!this.parentNode) {
      const manualShownNodes: BaseFieldNodesList = [];
      const manualFieldsNodes: BaseFieldNodesList = await Promise.all(
        availableFieldsList
          .filter((baseField) => baseField.kind === 'manual')
          .map(async (baseField) => {
            const fieldName =
              baseField.title || (await getFieldTitle(this.tableSpec, baseField.field.split('.'))) || baseField.field;
            const fieldNode: ViewFieldNode = {
              id: this.treeIdCounter!.getNodeId(),
              path: baseField.field,
              path_title: fieldName,
              name: fieldName,
              title: baseField.title,
              fieldName: baseField.field,
              fieldType: baseField.kind,
              nodeKind: baseField.kind,
            } as BaseFieldNode;

            if (showFieldList.find((showField: ShowFieldProps) => showField.field === fieldNode.path)) {
              fieldNode.selected = true;
              manualShownNodes.push(fieldNode);
            }

            return fieldNode;
          }),
      );
      this.treeNodes = [...this.treeNodes, ...manualFieldsNodes];
      this.shownNodes = [...this.shownNodes, ...manualShownNodes];
    }

    return this.treeNodes;
  }
}

export class ViewSettingsHelper {
  readonly domainModel: IDomainModel;
  tableName: string;
  userContext: string;
  root: any;
  ctrlNodes = ref<ViewFieldNodesList>();
  treeNodes = ref<ViewFieldNodesList>();
  shownNodes = ref<ViewFieldNodesList>();
  sortedNodes = ref<ViewFieldNodesList>();
  filteredNodes = ref<ViewFieldNodesList>();

  constructor(domainModel: IDomainModel, tableName: string, userContext: string, root: any) {
    this.domainModel = domainModel;
    this.tableName = tableName;
    this.userContext = userContext;
    this.root = root;
  }

  prepareHelper() {
    return {
      treeNodesList: this.treeNodes,
      shownNodesList: this.shownNodes,
      sortedNodesList: this.sortedNodes,
      filteredNodesList: this.filteredNodes,
      ctrlNodesList: this.ctrlNodes,
    };
  }

  async getAvailableFields() {
    const baseViewSettings = await getBaseViewSettings(
      this.domainModel,
      this.tableName,
      this.userContext,
    );
    return baseViewSettings['available_fields'];
  }

  async getViewSettings() {
    return await getTableViewSettings(this.domainModel, this.tableName, this.userContext);
  }

  async tuneViewSettingsHelper() {
    const tableSpec = await this.domainModel.getEntitySpec(this.tableName);
    const availableFields = await this.getAvailableFields();
    const viewSettings = await this.getViewSettings();
    const childrenMaker = new ViewTableFieldsTreeMaker(this.domainModel, tableSpec, undefined, undefined, undefined);
    this.treeNodes.value = await childrenMaker.makeFieldsTree(availableFields, viewSettings);
    this.shownNodes.value = viewSettings.columns
      ? viewSettings.columns
          .filter((column: any) => childrenMaker.shownNodes.some((node) => node.path === column.field))
          .map((column: any) => childrenMaker.shownNodes.find((node) => node.path === column.field))
      : [];
    this.sortedNodes.value = childrenMaker.sortedNodes;
    this.sortedNodes.value = viewSettings.sorts
      ? viewSettings.sorts
          .filter((column: any) => childrenMaker.sortedNodes.some((node) => node.path === column.field))
          .map((column: any) => childrenMaker.sortedNodes.find((node) => node.path === column.field))
      : [];
    this.filteredNodes.value = undefined;
  }

  resetViewSettingsHelper() {
    this.ctrlNodes.value = undefined;
    this.treeNodes.value = undefined;
    this.shownNodes.value = undefined;
    this.sortedNodes.value = undefined;
    this.filteredNodes.value = undefined;
  }

  updateCtrlNodes(nodeItem: ViewFieldNode) {
    const copy = this.ctrlNodes.value ?? [];
    const index = copy.indexOf(nodeItem);
    if (index >= 0) {
      copy.splice(index, 1);
    } else {
      copy.push(nodeItem);
    }
    this.ctrlNodes.value = copy;
  }

  shownChanged(nodeItem: ViewFieldNode) {
    const copy = this.shownNodes.value ?? [];
    this.shownNodes.value = [];
    const index = copy.indexOf(nodeItem);
    if (nodeItem.selected) {
      if (index < 0) {
        copy.push(nodeItem);
      }
    } else if (index >= 0) {
      copy.splice(index, 1);
    }
    this.updateCtrlNodes(nodeItem);
    this.root.$nextTick(() => {
      this.shownNodes.value = copy;
    });
  }

  shownPermutation(nodesList: ViewFieldNodesList) {
    this.shownNodes.value = [...nodesList];
  }

  sortedChanged(nodeItem: ViewFieldNode) {
    const copy = this.sortedNodes.value ?? [];
    this.sortedNodes.value = undefined;
    const index = copy.indexOf(nodeItem);
    if (nodeItem.sortDirection === SortDirection.Ascending || nodeItem.sortDirection === SortDirection.Descending) {
      if (index < 0) {
        copy.push(nodeItem);
      }
    } else if (index >= 0) {
      copy.splice(index, 1);
    }
    this.updateCtrlNodes(nodeItem);
    this.root.$nextTick(() => {
      this.sortedNodes.value = copy;
    });
  }

  sortedPermutation(nodesList: ViewFieldNodesList) {
    this.sortedNodes.value = [...nodesList];
  }

  filteredChanged(nodeItem: ViewFieldNode) {
    const copy = this.filteredNodes.value ?? [];
    this.filteredNodes.value = undefined;
    const index = copy.indexOf(nodeItem);
    if (nodeItem.filter) {
      if (index < 0) {
        copy.push(nodeItem);
      }
    } else if (index >= 0) {
      copy.splice(index, 1);
    }
    this.updateCtrlNodes(nodeItem);
    this.root.$nextTick(() => {
      this.filteredNodes.value = copy;
    });
  }

  makeTableViewSettings() {
    const showFieldsList = this.shownNodes.value!.map((showNode) => ({field: showNode.path}));
    const tableViewSettings: TableViewProps = {};
    tableViewSettings.columns = showFieldsList;
    if (this.sortedNodes.value) {
      tableViewSettings.sorts = this.sortedNodes.value!.map((sortedNode) => ({
        field: sortedNode.path,
        order: sortedNode.sortDirection,
      }));
    }
    return tableViewSettings;
  }
}

export class SmartViewSettingsHelper extends ViewSettingsHelper {
  smartTable: any;

  constructor(domainModel: IDomainModel, tableName: string, smartTable: any, root: any) {
    super(domainModel, tableName, '', root);
    this.smartTable = smartTable;
  }

  async getAvailableFields() {
    const res = await getViewAvailableFields(
      this.domainModel,
      this.smartTable.apiModel,
      this.root.$auth.user,
      this.smartTable.allColumns,
      [],
    );
    res.forEach((column) => {
      if (column.value) {
        column.kind = 'manual';
      }
    });
    return res;
  }

  async getViewSettings() {
    return await loadTableSettings(this.smartTable.apiModel, this.smartTable.contextId);
  }
}
