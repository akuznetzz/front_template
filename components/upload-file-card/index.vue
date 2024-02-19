<template>
  <div style="width: 50%; height: 30%" class="pa-2">
    <v-card class="expanded-card">
      <v-card-actions style="padding-bottom: 0">
        <v-spacer />
        <v-btn color="primary" small @click="acceptedCard()" :disabled="!selectedFile">
          <v-icon left> mdi-file-import-outline </v-icon>
          Начать обработку
        </v-btn>
        <v-btn icon title="Закрыть" @click="closeCard(false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
      <v-row justify="center">
        <v-col :cols="6" v-if="encoding">
          <v-select
            :items="fileEncodings"
            label="Кодировка файла:"
            item-text="text"
            item-value="value"
            v-model="selectedEncoding"
          />
        </v-col>
        <v-col :cols="6">
          <v-file-input
            label="Выберите файл"
            v-model="selectedFile"
            :rules="[(v) => Boolean(v) || 'Поле должно быть заполнено']"
            @change="setFileData"
          />
        </v-col>
      </v-row>
      <div class="scrollable-items-holder">
        <div class="scrolling-item"></div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import EditFrame from '~/framework/edit-frame/edit-frame.vue';
import {httpPost, HTTP_200_OK} from '~/framework/httpRequest';
import {info, warn} from '~/framework/messages';

const fileEncodings = [
  {value: 'cp1251', text: 'Windows 1251'},
  {value: 'utf-8', text: 'UTF-8'},
];

export default defineComponent({
  name: 'UploadFileCard',

  components: {
    EditFrame,
  },
  props: {
    link: {
      type: String,
      required: true
    },
    encoding: {
      type: Boolean
    }
  },

  setup(props, {emit}) {
    const selectedEncoding = ref(fileEncodings[0].value);
    const selectedFile = ref();
    const file = ref();

    function closeCard(accept: boolean = false, payload: any = undefined) {
      emit('closeContext', {
        modalResult: accept ? ModalResult.Accepted : ModalResult.Denied,
        payload,
      });
    }

    function setFileData(e: any) {
      file.value = e;
    }

    async function acceptedCard() {
      const formData = new FormData();
      formData.append('encoding', String(selectedEncoding.value));
      formData.append('uploading_file', file.value, file.value.name);

      const result = await httpPost(props.link, formData);
      if (result.status === HTTP_200_OK) {
        info(result.data.message);
        closeCard(true);
      } else {
        warn(result.data);
      }
    }

    return {
      closeCard,
      acceptedCard,
      fileEncodings,
      selectedEncoding,
      selectedFile,
      setFileData,
    };
  },
});
</script>

<style scoped>
.expanded-card {
  width: 100%;
  height: 100%;
  padding: 0 8px;
}

.scrolling-item {
  width: 100%;
  height: 100%;
  padding: 10px 5px 3px 5px;
  overflow: auto;
}

.scrollable-items-holder {
  width: 100%;
  height: calc(100vh - 150px);
  overflow: hidden;
}
</style>
