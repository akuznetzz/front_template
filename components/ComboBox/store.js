import Vue from 'vue';
import Vuex from 'vuex';
import {getEntitySettings} from '~/common/settings.ts';
import {httpGet} from '~/framework/httpRequest';

Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: {
      apiModel: {
        name: '',
        semanticFields: [],
        targetField: '',
      },
      relatedModel: {
        name: '',
        semanticFields: [],
        targetField: '',
      },

      targetField: '',
      url: '',
      urlIncludes: '?',
      resourceName: '',
      resourceNamePlural: '',
      relatedResourceName: '',
      relatedResourceNamePlural: '',
      relatedMode: false,
      semanticMode: false,
      semanticFields: [],

      items: [],
      itemInfo: { value: '', text: '' },
      selectedModel: null,
      selectedModels: [],

      itemsCount: 20, // request per page items
      delay: 1000, // ms request delay for waiting user input ends
      timer: null,  // delay timer

    },

    mutations: {
      setStateProp(state, prop) {
        state[prop.name] = prop.value;
      },
    },

    actions: {
      async createComponent({ state, dispatch }, { apiModel }) {
        await dispatch('getModelProps', {
          apiModelName: apiModel,
          statePropName: 'apiModel'
        });
        const entitySpec = await $nuxt.$domainModel.getEntitySpec(state.apiModel.name)
        state.url = entitySpec.url;
        state.itemInfo.value = state.apiModel.primaryKey;
        if (state.apiModel.targetField) {
          state.targetField = state.apiModel.targetField;
        } else {
          await dispatch('findTargetField', state.apiModel.name);
        }
        state.itemInfo.text = state.targetField;
        state.semanticFields = state.apiModel.semanticFields;
        state.resourceName = entitySpec.options.resource_name;
        state.resourceNamePlural = entitySpec.options.resource_name_plural;

        if (state.apiModel.targetField && state.semanticFields.length === 0
          && entitySpec.options.properties[state.apiModel.targetField].type === 'one') {
          await dispatch('getModelProps', {
            apiModelName: entitySpec.options.properties[state.apiModel.targetField].related_to,
            statePropName: 'relatedModel'
          });
          state.urlIncludes = `?include[]=${state.apiModel.targetField}.*`;
          if (state.relatedModel.targetField) {
            state.targetField = state.relatedModel.targetField;
          } else {
            await dispatch('findTargetField', entitySpec.options.properties[state.apiModel.targetField].related_to);
          }
          state.itemInfo.text = `fromRelated_${state.targetField}`;
          state.relatedMode = true;
          const relatedEntitySpec = await $nuxt.$domainModel.getEntitySpec(state.relatedModel.name);
          state.relatedResourceName = relatedEntitySpec.options.resource_name;
          state.relatedResourceNamePlural = relatedEntitySpec.options.resource_name_plural;
          state.semanticFields = [];
          state.relatedModel.semanticFields.forEach(field => {
            state.semanticFields.push(`${state.apiModel.targetField}.${field}`);
          })
        }
        state.semanticMode = state.semanticFields.length > 0;
        state.itemInfo.text = state.semanticMode ? 'semanticFields' : state.itemInfo.text;
      },

      async getModelProps({ state, commit }, { apiModelName, statePropName }) {
        let entitySettings = getEntitySettings(apiModelName);
        let props = {
          name: apiModelName,
          semanticFields: entitySettings['semanticFields'] ? entitySettings['semanticFields'] : [],
          targetField: entitySettings['targetField'],
          primaryKey: entitySettings['primaryKey'] ? entitySettings['primaryKey'] : 'id',
        };
        commit('setStateProp', { name: statePropName, value: props });
      },

      async loadValue({ state }, { primaryKeyValue, multiple }) {
        let response
        try {
          response = await httpGet(`${state.url}/${primaryKeyValue}${state.urlIncludes}`);
        } catch(e) {
          state.selectedModel = primaryKeyValue;
          throw new Error(e.message)
        }
        let currentItem = response.data[state.resourceName];
        let relatedItemData = state.relatedMode && response.data[state.relatedResourceNamePlural]
        && response.data[state.relatedResourceNamePlural].length > 0
          ? response.data[state.relatedResourceNamePlural][0] : currentItem;
        if (state.semanticMode) {
          let semanticFields = state.relatedMode ? state.relatedModel.semanticFields : state.apiModel.semanticFields;
          currentItem[state.itemInfo.text] = '';
          for (let field of semanticFields) {
            currentItem[state.itemInfo.text] = `${currentItem[state.itemInfo.text]} ${relatedItemData[field] ? relatedItemData[field] : ''}`;
          }
        } else {
          currentItem[state.itemInfo.text] = relatedItemData[state.targetField] ? relatedItemData[state.targetField] : '';
        }
        if (multiple) {
          state.selectedModels.push(currentItem);
        } else {
          state.selectedModel = currentItem;
        }
      },

      async loadCurrentValue({ state, dispatch }, { currentValue, multiple }) {
        if (multiple) {
          for (let primaryKeyValue of currentValue) {
            await dispatch('loadValue', { primaryKeyValue, multiple });
          }
        } else {
          await dispatch('loadValue', { primaryKeyValue: currentValue, multiple });
        }
      },

      loadItems({ state, commit }, filterValue) {
        let mod = Number.isInteger(+filterValue) ? '' : '.icontains';
        clearTimeout(state.timer);
        state.timer = setTimeout(async () => {
          let items;
          if (state.semanticMode) {
            items = [];
            for (let field of state.semanticFields) {
              let response = await $nuxt.$axios.$get(
                `${state.url}${state.urlIncludes}&filter{${field}${mod}}=${filterValue}&sort[]=${field}&per_page=${state.itemsCount}`
              );
              let data = response[state.resourceNamePlural];
              data.forEach(item => {
                item[state.itemInfo.text] = '';
                let itemSemanticFields;
                let relatedItemData;
                if(state.relatedMode){
                  itemSemanticFields = state.relatedModel.semanticFields;
                  relatedItemData = response[state.relatedResourceNamePlural].find(
                  relatedItem => relatedItem[state.relatedModel.primaryKey] === item[state.apiModel.targetField]);
                }else{
                  itemSemanticFields = state.semanticFields;
                  relatedItemData = item;
                }
                for (let field of itemSemanticFields) {
                  item[state.itemInfo.text] = `${item[state.itemInfo.text]} ${relatedItemData[field] ? relatedItemData[field] : ''}`;
                }
              });
              items = [...items, ...data];
            }
          } else {
            let field = state.relatedMode ? `${state.apiModel.targetField}.${state.relatedModel.targetField}` : state.apiModel.targetField;
            let response = await $nuxt.$axios.$get(
              `${state.url}${state.urlIncludes}&filter{${field}${mod}}=${filterValue}&sort[]=${field}&per_page=${state.itemsCount}`
            );
            items = response[state.resourceNamePlural];
            if (state.relatedMode) {
              let relatedData = response[state.relatedResourceNamePlural];
              for (let item of items) {
                let relatedItem = relatedData.find(relatedItem =>
                  item[state.apiModel.targetField] === relatedItem[state.relatedModel.primaryKey]
                );
                item[state.itemInfo.text] = relatedItem[state.relatedModel.targetField]
              }
            }
          }
          await commit('setStateProp', { name: 'items', value: items });
        }, state.delay);
      },
      async findTargetField({ state }, apiModel) {
        let typicalNames = ['flow_name', 'name_short', 'last_name', 'title', 'signature', 'comment'];
        let relatedName = 'name';
        let apiModelEntitySpec = await $nuxt.$domainModel.getEntitySpec(apiModel);
        typicalNames.forEach(item => {
          if (apiModelEntitySpec.options.properties.hasOwnProperty(item)) {
            relatedName = item;
          }
        });
        state.targetField = relatedName;
      },
    },
    getters: {
      getItems: state => state.items,
      getSelectedModel: state => state.selectedModel,
      getSelectedModels: state => state.selectedModels,
      getItemInfo: state => state.itemInfo
    }
  })
}
