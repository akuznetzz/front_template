import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: {
      imgName: '',
      img: '',
      defImage: '',
      smallImage: ''
    },

    mutations: {
      setProp(state, prop) {
        state[prop.name] = prop.value;
      },
    },

    actions: {
    },

    getters: {
      getImg: state => state.img,
      getImgName: state => state.imgName,
      getSmallImageURL: state => {
        if (state.smallImage) {
          if ($nuxt.$axios.defaults.baseURL.endsWith('/')) {
            return $nuxt.$axios.defaults.baseURL.split('/').slice(0, -2).join('/') + state.smallImage;
          }
          else {
            return $nuxt.$axios.defaults.baseURL.split('/').slice(0, -1).join('/') + state.smallImage;
          }
        }
      }
    }
  })
}
