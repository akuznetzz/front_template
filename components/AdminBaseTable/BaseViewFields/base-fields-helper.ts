import {IDomainModel, IEntitySpec} from '~/framework/dbd/dbd-spec';
import {BaseViewField, BaseViewFields} from '~/components/AdminBaseTable/base-table-view';

export type BaseFieldNodesList = Array<BaseFieldNode>;

export type BaseFieldNode = {
  id: any;
  path: string;
  path_title: string;
  name: string;
  title?: string;
  fieldName: string;
  fieldType: string;
  selected?: boolean;
  related_to?: string;
  children?: BaseFieldNodesList;
  nodeKind?: string;
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

export class TableFieldsTreeMaker {
  readonly domainModel: IDomainModel;
  readonly tableSpec: IEntitySpec;
  readonly treeIdCounter: TreeIdCounter;
  readonly parentNode?: BaseFieldNode;
  readonly reMakeTree: boolean;
  readonly availableFields: BaseViewFields;
  treeNodes: BaseFieldNodesList = [];
  selectedNodes: BaseFieldNodesList = [];
  openNodes: BaseFieldNodesList = [];

  constructor(
    domainModel: IDomainModel,
    tableSpec: IEntitySpec,
    treeIdCounter: TreeIdCounter,
    parentNode?: BaseFieldNode,
    reMakeTree: boolean = false,
    availableFields: BaseViewFields = [],
  ) {
    this.domainModel = domainModel;
    this.tableSpec = tableSpec;
    this.treeIdCounter = treeIdCounter;
    this.parentNode = parentNode;
    this.reMakeTree = reMakeTree;
    this.availableFields = availableFields;
  }

  async makeTableFieldsTree() {
    this.treeNodes = await Promise.all(
      Array.from(this.tableSpec.fieldSpecs.entries()).map(async ([, fieldSpec]) => {
        const fieldNode: BaseFieldNode = {
          id: this.treeIdCounter.getNodeId(),
          path: this.parentNode ? `${this.parentNode.path}.${fieldSpec.name}` : fieldSpec.name,
          path_title: this.parentNode ? `${this.parentNode.path_title} -> ${fieldSpec.label}` : fieldSpec.label,
          name: fieldSpec.label,
          fieldName: fieldSpec.name,
          fieldType: fieldSpec.type,
        };

        if (fieldSpec.type === 'one') {
          fieldNode.children = [];
          fieldNode.related_to = fieldSpec.related_to;
        }
        if (!this.reMakeTree) {
          return fieldNode;
        }
        const availableField = this.availableFields.find((item: any) => item.field === fieldNode.path);
        if (availableField) {
          if (!this.selectedNodes.find((nodeItem: BaseFieldNode) => nodeItem.path === fieldNode.path)) {
            fieldNode.title = availableField.title;
            fieldNode.selected = true;
            this.selectedNodes.push(fieldNode);
          }
        }
        if (!fieldNode.related_to) {
          return fieldNode;
        }
        if (this.availableFields.find((item: any) => item.field.indexOf(`${fieldNode.path}.`) === 0)) {
          const childrenMaker = new TableFieldsTreeMaker(
            this.domainModel,
            await this.domainModel.getEntitySpec(fieldNode.related_to),
            this.treeIdCounter,
            fieldNode,
            this.reMakeTree,
            this.availableFields,
          );
          fieldNode.children = await childrenMaker.makeTableFieldsTree();
          this.selectedNodes = [...this.selectedNodes, ...childrenMaker.selectedNodes];
          this.openNodes = [...this.openNodes, fieldNode, ...childrenMaker.openNodes];
        }
        return fieldNode;
      }),
    );
    if (!this.parentNode) {
      const manualFieldsNodes: BaseFieldNodesList = this.availableFields
        .filter((baseField) => baseField.kind === 'manual')
        .map((baseField) => {
          return {
            id: this.treeIdCounter!.getNodeId(),
            path: baseField.field,
            path_title: baseField.title,
            name: baseField.title,
            title: baseField.title,
            fieldName: baseField.field,
            fieldType: baseField.kind,
            nodeKind: baseField.kind,
            selected: true,
          } as BaseFieldNode;
        });

      this.treeNodes = [...this.treeNodes, ...manualFieldsNodes];
      this.selectedNodes = [...this.selectedNodes, ...manualFieldsNodes];
    }

    return this.treeNodes;
  }
}

export class BaseViewFieldsHelper {
  readonly domainModel: IDomainModel;
  tableName: string;
  root: any;
  treeIdCounter?: TreeIdCounter;
  ctrlNodes = ref<BaseFieldNodesList>();
  treeNodes = ref<BaseFieldNodesList>();
  selectedNodes = ref<BaseFieldNodesList>();
  openNodes = ref<BaseFieldNodesList>();

  constructor(domainModel: IDomainModel, tableName: string, root: any) {
    this.domainModel = domainModel;
    this.tableName = tableName;
    this.root = root;
  }

  prepare() {
    return {
      treeNodesList: this.treeNodes,
      availableNodesList: this.selectedNodes,
      openNodesList: this.openNodes,
      ctrlNodesList: this.ctrlNodes,
    };
  }

  async tuneViewSettingsHelper(availableFields: any) {
    this.treeIdCounter = new TreeIdCounter();
    const childrenMaker = new TableFieldsTreeMaker(
      this.domainModel,
      await this.domainModel.getEntitySpec(this.tableName),
      this.treeIdCounter,
      undefined,
      true,
      availableFields,
    );
    this.treeNodes.value = await childrenMaker.makeTableFieldsTree();
    this.selectedNodes.value = childrenMaker.selectedNodes;
    this.openNodes.value = childrenMaker.openNodes;
  }

  async childrenNodesList(node: BaseFieldNode) {
    const childrenMaker = new TableFieldsTreeMaker(
      this.domainModel,
      await this.domainModel.getEntitySpec(node.related_to!),
      this.treeIdCounter!,
      node,
      false,
    );
    return await childrenMaker.makeTableFieldsTree();
  }

  reset() {
    this.ctrlNodes.value = undefined;
    this.treeNodes.value = undefined;
    this.selectedNodes.value = undefined;
    this.openNodes.value = undefined;
  }

  updateCtrlNodes(nodesList: BaseFieldNodesList) {
    const copy = this.ctrlNodes.value ?? [];
    nodesList.forEach((nodeItem) => {
      const index = copy.indexOf(nodeItem);
      if (index >= 0) {
        copy.splice(index, 1);
      } else {
        copy.push(nodeItem);
      }
    });
    this.ctrlNodes.value = copy;
  }

  availableChanged(changedNodesList: BaseFieldNodesList) {
    const copy = this.selectedNodes.value ?? [];
    this.selectedNodes.value = [];
    changedNodesList.forEach((nodeItem) => {
      const index = copy.indexOf(nodeItem);
      if (nodeItem.selected) {
        if (index < 0) {
          copy.push(nodeItem);
        }
      } else if (index >= 0) {
        copy.splice(index, 1);
      }
    });
    this.updateCtrlNodes(changedNodesList);
    this.root.$nextTick(() => {
      this.selectedNodes.value = copy;
    });
  }

  addManualFieldNode(fieldName: string, fieldTitle: string) {
    const fieldNode: BaseFieldNode = {
      id: this.treeIdCounter!.getNodeId(),
      path: fieldName,
      path_title: fieldTitle,
      name: fieldTitle,
      title: fieldTitle,
      fieldName,
      fieldType: 'manual',
      nodeKind: 'manual',
      selected: true,
    };
    this.treeNodes.value?.push(fieldNode);
    this.availableChanged([fieldNode]);
  }

  makeAvailableFields() {
    return this.selectedNodes.value
      ? this.selectedNodes.value.map((nodeItem: BaseFieldNode) => {
          const res: BaseViewField = {field: nodeItem.path};
          if (nodeItem.title) {
            res.title = nodeItem.title;
          }
          if (nodeItem.nodeKind) {
            res.kind = nodeItem.nodeKind;
          }
          return res;
        })
      : [];
  }

  clearSelectedNodesList() {
    if (!this.selectedNodes.value) {
      return;
    }
    this.selectedNodes.value.forEach((nodeItem) => (nodeItem.selected = false));
    this.availableChanged([...this.selectedNodes.value]);
  }
}
