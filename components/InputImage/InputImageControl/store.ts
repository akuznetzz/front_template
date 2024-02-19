import Vue from 'vue';
import Vuex from 'vuex';

import {httpPost} from '~/framework/httpRequest';
import {UPLOAD_URL} from '~/common/constants';
Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: {
      currentTempValue: '',
      uploadStatus: false,
      newValue: '',
      cFileName: '',
      cFile: ''
    },

    mutations: {
      setArrayProp(state: any, prop: any) {
        prop.forEach((p: any) => {
          state[p.name] = p.value;
        });
      }
    },

    actions: {
      async uploadFile ({commit}, prop) {
        commit('setArrayProp', [{name: 'uploadStatus', value: true}]);
        const formData = new FormData();
        formData.append('files', prop, prop.name);
        const filePath = await httpPost(UPLOAD_URL, formData);
        commit('setArrayProp', [
          {name: 'uploadStatus', value: false},
          {name: 'newValue', value: filePath.data.file_paths[0]}
        ]);
      }
    },

    getters: {
      getCurrentTempValue(state: any): object { return state.currentTempValue; },
      getUploadStatus(state: any): object { return state.uploadStatus; },
      getNewValue(state: any): object { return state.newValue; },
      getCFileName(state: any): object { return state.cFileName; },
      getCFile(state: any): object { return state.cFile; }
    }
  });
};
