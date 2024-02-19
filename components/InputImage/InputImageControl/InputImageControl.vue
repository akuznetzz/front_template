<template>
  <div style="width: 100%">
    <a
      v-show="false"
      ref="imageDownload"
      :href="cFile || currentTempValue"
      :download="cFileName || currentFileName"
      target="_blank"
      >a</a
    >
    <v-file-input
      v-show="!(currentTempValue || newValue)"
      hint="Выберите фото"
      :disabled="readonly"
      validate-on-blur
      :label="label"
      :rules="fileRule"
      :error="error"
      prepend-icon="mdi-image"
      :error-messages="errorMessages"
      :color="color"
      :loading="uploadStatus"
      @change="change($event)"
    />
    <input v-show="false" ref="imageUploadHidden" type="file" accept="image/*" @change="change($event)" />
    <v-card
      v-if="currentTempValue || newValue"
      class="hover-for-controls"
      align="center"
      justify="center"
      :style="'height: 100px'"
    >
      <img :src="cFile || currentTempValue" class="image-small-pre" />
      <div v-if="!readonly" style="position: absolute; right: 10px; top: 10px">
        <v-btn icon small color="error" title="Удалить" outlined @click="removePhoto()">
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
      </div>
      <label class="image-label"> {{ label }} </label><br />
      <v-row justify="center" class="affect-controls">
        <v-menu open-on-hover top offset-y>
          <template v-slot:activator="{on}">
            <v-btn class="mr-2" small title="Развернуть" v-on="on">
              <v-icon>mdi-arrow-expand-all</v-icon>
            </v-btn>
          </template>
          <v-card style="max-width: 800px">
            <img :src="cFile || currentTempValue" class="image-big-pre" />
          </v-card>
        </v-menu>
        <v-btn small title="Сохранить" class="mr-2" @click="$refs.imageDownload.click()">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn v-if="!readonly" small title="Загрузить" @click="$refs.imageUploadHidden.click()">
          <v-icon>mdi-upload</v-icon>
        </v-btn>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts">
import store from './store';
import {MESSAGE_FIELD_MUST_INPUT} from '~/common/constants';
import {Store} from 'vuex';

export default defineComponent({
  props: {
    currentValue: {
      type: String,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    rules: {
      type: Array,
      default: () => [],
    },
    error: {
      type: Boolean,
      default: false,
    },
    errorMessages: {
      type: Array,
      default: () => [],
    },
    deletable: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'primary',
    },
  },
  setup(props, {emit}) {
    const localStore: Store<any> = store();
    const imageDownload: any = ref(null);
    const imageUploadHidden: any = ref(null);

    localStore.commit('setArrayProp', [{name: 'currentTempValue', value: props.currentValue}]);

    const fileRule = computed(() => {
      const rules: Array<any> = [];
      if (props.rules.length) {
        const rule = (v: any) => !!v || !!currentTempValue.value || MESSAGE_FIELD_MUST_INPUT;
        rules.push(rule);
      }
      return rules;
    });

    const currentTempValue = computed({
      get(): string {
        return localStore.getters.getCurrentTempValue;
      },
      set(v): void {
        localStore.commit('setArrayProp', [{name: 'currentTempValue', value: v}]);
      },
    });

    const currentFileName = computed(() => {
      let filName: string = '';
      if (currentTempValue.value) {
        filName = localStore.getters.getCurrentTempValue.split('/').pop();
      }
      return filName;
    });

    const uploadStatus = computed(() => localStore.getters.getUploadStatus);

    const newValue = computed({
      get() {
        return localStore.getters.getNewValue;
      },
      set(v): void {
        localStore.commit('setArrayProp', [{name: 'newValue', value: v}]);
      },
    });

    const cFile = computed({
      get() {
        return localStore.getters.getCFile;
      },
      set(v): void {
        localStore.commit('setArrayProp', [{name: 'cFile', value: v}]);
      },
    });

    const cFileName = computed({
      get() {
        return localStore.getters.getCFileName;
      },
      set(v): void {
        localStore.commit('setArrayProp', [{name: 'cFileName', value: v}]);
      },
    });

    async function change(e: any) {
      if (e) {
        if (e.target) {
          e = e.target.files[0] || e.dataTransfer.files[0];
        }
        cFile.value = URL.createObjectURL(e);
        cFileName.value = e.name;
        await localStore.dispatch('uploadFile', e);
        emit('change', newValue.value);
      } else {
        cFile.value = '';
        cFileName.value = '';
        emit('change', '');
      }
    }

    function removePhoto() {
      currentTempValue.value = '';
      newValue.value = '';
      cFile.value = '';
      cFileName.value = '';
      emit('change', '');
    }

    return {
      cFile,
      cFileName,
      currentFileName,
      newValue,
      currentTempValue,
      removePhoto,
      fileRule,
      change,
      uploadStatus,
      imageDownload,
      imageUploadHidden,
    };
  },
});
</script>

<style scoped>
.hover-for-controls:hover .affect-controls {
  opacity: 0.5;
}
.affect-controls {
  opacity: 0;
  position: absolute;
  bottom: 10px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
}
.image-small-pre {
  max-width: 100%;
  max-height: 100%;
  object-fit: scale-down;
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
}
.image-big-pre {
  max-width: 100%;
  max-height: 100%;
  object-fit: scale-down;
}
.image-label {
  font-size: 12px;
  position: absolute;
  left: 10px;
}
</style>
