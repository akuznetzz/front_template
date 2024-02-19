import Vue from 'vue';
import Vuex from 'vuex';
import { httpGet } from '~/framework/httpRequest';

Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: {
      items: [],
      search: null,
      APIRequest: '',
      itemText: ''
    },

    mutations: {
      setProp(state, prop) {
        state[prop.name] = prop.value;
      },
      setSearch(state, prop) {
        state.search = prop;
      },
      setItems(state, prop) {
        for (let p in prop) {
          if (p !== 'meta') {
            state.items = prop[p];
          }
        }
      },
      pushItems(state, prop) {
        state.items.push(prop);
      }
    },

    actions: {
      async loadItems({ state, commit }, prop) {
        let i = await httpGet(`${state.APIRequest}?filter{${state.itemText}.icontains}=${prop}&sort[]=${state.itemText}&per_page=30`);
        await commit('setItems', i.data)
      },
      async loadDefaultValue({commit}, prop) {
        if (prop) {
          await commit('pushItems', prop);
        }
      }
    },

    getters: {
      getSearch: state => state.search,
      getItems: state => state.items,
    }
  })
}
