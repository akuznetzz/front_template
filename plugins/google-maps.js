import Vue from 'vue';
import * as VueGoogleMaps from 'vue2-google-maps';
import GmapCluster from 'vue2-google-maps/src/components/cluster';

Vue.component('GmapCluster', GmapCluster);
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyBHIJATqt7TU_933U-a9gebxHpYLBDfE7M',
  },
});
