import * as assert from 'assert';
import {domainModelAddition} from '~/common/domainModelAddition';
import {assertIsDefined} from '~/common/assertions';
import {IDomainModel, IEntitySpec, FieldSpec} from '~/framework/dbd/dbd-spec';
import {TableSpecImpl, createFieldSpecImpl, EntitySpecOptionsImpl} from '~/framework/dbd/dbd-impl';
import {WithLoadingMixin} from '~/framework/mixins/with-loading-mixin';

export const domainModelInjectionKey: InjectionKey<IDomainModel> = Symbol();

export function initDomainModel(axios: any): IDomainModel {
  return new DomainModel(axios);
}

export async function getFieldSpecByEntitySpec(entitySpec: IEntitySpec, fullFieldName: string): Promise<FieldSpec> {
  return getFieldSpecByFieldPath(entitySpec, fullFieldName.split('.'));
}

export async function getFieldSpec(
  domainModel: IDomainModel,
  modelName: string,
  fullFieldName: string,
): Promise<FieldSpec> {
  return getFieldSpecByEntitySpec(await domainModel.getEntitySpec(modelName), fullFieldName);
}

async function getFieldSpecByFieldPath(entitySpec: IEntitySpec, fieldPath: string[]): Promise<FieldSpec> {
  let fieldSpec = entitySpec.getFieldSpec(fieldPath[0]);
  if (fieldPath.length > 1) {
    assertIsDefined(fieldSpec.related_to, 'Field in field path expected to be related to model');
    const relatedEntitySpec = await entitySpec.domainModel.getEntitySpec(fieldSpec.related_to);
    fieldSpec = await getFieldSpecByFieldPath(relatedEntitySpec, fieldPath.slice(1));
  }
  return fieldSpec;
}

class DomainModel extends WithLoadingMixin(Object) implements IDomainModel{
  apiUrl = '';
  entities: {[index: string]: any} = {};
  axios = <any>{};

  constructor(axios: any) {
    super();
    this.apiUrl = axios.defaults.baseURL;
    this.axios = axios;
  }

  async getEntitiesList() {
    await this.withLoading(() => this.loadApi());
    return this.entities;
  }

  async getEntitySpec(entityName: string): Promise<IEntitySpec> {
    await this.withLoading(() => this.loadApi());
    const entity = this.entities[entityName];
    assert.ok(entity, `DomainModel: No entities named "${entityName}" found!`);
    await entity.loadOptions(this.axios);
    return entity;
  }

  async loadApi() {
    const api = await this.axios.get(this.apiUrl);
    for (const apiGroup in api.data) {
      for (const apiGroupProp in api.data[apiGroup]) {
        const apiGroupPropFiltered = api.data[apiGroup][apiGroupProp].includes('/flow/cases')
          ? `flow-${apiGroupProp}`
          : apiGroupProp;
        const entitySpec = new EntitySpec(this, apiGroupPropFiltered, api.data[apiGroup][apiGroupProp]);
        Object.assign(this.entities, {[apiGroupPropFiltered]: entitySpec});
      }
    }
  }
}

class EntitySpec extends WithLoadingMixin(TableSpecImpl) {

  constructor(domainModel: IDomainModel, entityName: string, url: string) {
    super(entityName, domainModel);
    this.url = url;
    const entitySpecAddition = domainModelAddition(entityName);
    if (entitySpecAddition) {
      Object.assign(this, entitySpecAddition);
    }
  }

  async loadOptions(axios: any) {
    await this.withLoading(async () => {
      function capitalizeFirstChar(string?: string): string | undefined {
        if (string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
        }
      }

      this.options = new EntitySpecOptionsImpl();
      const extOptions = await axios.options(this.url);
      const extOptionsData = extOptions.data;
      Object.assign(this.options, extOptionsData);
      this.resource_name = extOptionsData.resource_name;
      this.resource_name_plural = extOptionsData.resource_name_plural;
      this.verboseName = capitalizeFirstChar(extOptionsData.verbose_name);
      this.verboseNamePlural = capitalizeFirstChar(extOptionsData.verbose_name_plural);
      for (const key of Object.keys(this.options.properties)) {
        const extFieldSpec = this.options.properties[key];
        let fieldSpec = createFieldSpecImpl(key, this);
        Object.assign(fieldSpec, extFieldSpec);
        this.addFieldSpecImpl(fieldSpec);
      }
    });
  }
}
