<template>
  <catch-control
    :drop-title="dropTitle"
    :suitable-types="suitableMimeTypes"
    :disable-drag-and-drop="disableDragAndDrop"
    @catchFilesList="onChange"
  >
    <template v-slot:catchPanel>
      <div style="width: 100%">
        <a v-show="false" ref="imageDownload" :href="getFullPath" :download="getFileName" target="_blank" />
        <v-file-input
          v-if="!getFullPath"
          :disabled="props.field.refReadOnly.value"
          :hint="props.field.refReadOnly.value ? '' : $t('editCards.photoGallery.choosePhoto')"
          validate-on-blur
          :label="label"
          :rules="rules"
          prepend-icon="mdi-image"
          :loading="loading"
          :accept="suitableFileExts"
          @change="onChange"
        />
        <input v-show="false" ref="imageUploadHidden" type="file" accept="image/*" @change="onChange" />
        <v-card v-if="getFullSmallPath" class="hover-for-controls" justify="center" :style="'height: 200px'">
          <img :src="getFullSmallPath" class="image-small-pre" />
          <div v-if="!props.field.refReadOnly.value" style="position: absolute; right: 10px; top: 10px">
            <v-btn icon small color="error" :title="$t('common.delete')" outlined @click="removePhoto()">
              <v-icon>mdi-delete-outline</v-icon>
            </v-btn>
          </div>
          <label class="image-label"> {{ label }} </label><br />
          <v-row justify="center" class="affect-controls">
            <v-menu open-on-hover top offset-y>
              <template #activator="{on}">
                <v-btn class="mr-2" small :title="$t('common.expand')" v-on="on">
                  <v-icon>mdi-arrow-expand-all</v-icon>
                </v-btn>
              </template>
              <v-card style="max-width: 800px">
                <img :src="getFullPath" class="image-big-pre" />
              </v-card>
            </v-menu>
            <v-btn small :title="$t('common.save')" class="mr-2" @click="$refs.imageDownload.click()">
              <v-icon>mdi-download</v-icon>
            </v-btn>
            <v-btn
              v-if="!props.field.refReadOnly.value"
              small
              :title="$t('common.upload')"
              @click="$refs.imageUploadHidden.click()"
            >
              <v-icon>mdi-upload</v-icon>
            </v-btn>
          </v-row>
        </v-card>
      </div>
    </template>
  </catch-control>
</template>

<script lang="ts">
import {fieldValueFromString} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {httpPost} from '~/framework/httpRequest';
import {UPLOAD_URL} from '~/common/constants';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';
import {getAPIPath} from '~/common/urlUtils';
import {loadFileTypesDef} from '~/framework/drag-and-drop-controls/catch-control-consts';
import CatchControl from '~/framework/drag-and-drop-controls/catch-control.vue';
import {t} from '~/common/localization-utils';

export default defineComponent({
  name: 'ImageInputControl',

  components: {
    CatchControl,
  },

  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
    dropTitle: {
      type: String,
      default: () => t('editCards.photoGallery.releasePhoto'),
    },
    extra: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    const rules = useRequiredRule(props.field.spec);
    const loading = ref(false);
    const tempImage = ref('');

    const suitableFileExts = computed(() => {
      const extra = props.field.extra;
      let fileExts = loadFileTypesDef.imageDocFile?.fileExts;
      if (extra?.acceptFileFormat) {
        if (Object.keys(loadFileTypesDef).includes(extra.acceptFileFormat)) {
          fileExts = loadFileTypesDef[extra.acceptFileFormat].fileExts;
        } else {
          fileExts = extra.acceptFileFormat.split(' ');
        }
      }
      return fileExts ? fileExts.map((extension: string) => `.${extension}`).join(',') : 'image/*';
    });

    const suitableMimeTypes = computed(() => {
      const extra = props.field.extra;
      return extra?.acceptFileFormat && Object.keys(loadFileTypesDef).includes(extra.acceptFileFormat)
        ? loadFileTypesDef[extra.acceptFileFormat].mimeTypes
        : loadFileTypesDef.imageDocFile?.mimeTypes;
    });

    const getFullPath = computed(() => {
      if (props.field.value && !props.field.value.asString().startsWith('upload/')) {
        return props.field.value.asString();
      } else if (tempImage.value) {
        return tempImage.value;
      } else if (props.field?.extra?.tempImage) {
        return props.field.extra.tempImage;
      }
      return undefined;
    });

    const getFullSmallPath = computed(() => {
      if (tempImage.value) {
        return tempImage.value;
      } else if (props.field?.extra?.tempImage) {
        return props.field.extra.tempImage;
      } else if (props.field?.extra?.smallPhoto) {
        return getAPIPath() + props.field.extra.smallPhoto;
      } else if (props.field.value && !props.field.value.asString().startsWith('upload/')) {
        return props.field.value.asString();
      }
      return undefined;
    });

    const getFileName = computed(() =>
      getFullPath.value ? decodeURIComponent(getFullPath.value.split('/').pop() as string) : undefined,
    );

    const disableDragAndDrop = computed(() => props.extra?.disableDragAndDrop || props.field.refReadOnly.value);

    async function onChange(value: any) {
      if (value) {
        if (value?.target) {
          value = value.target.files[0] || value.dataTransfer.files[0];
        } else if (value instanceof FileList || value instanceof Array) {
          value = value[0];
        }
        if (!value) {
          return;
        }
        loading.value = true;
        try {
          const formData = new FormData();
          formData.append('files', value, value.name);
          const filePath = await httpPost(UPLOAD_URL, formData);
          props.field.value = fieldValueFromString(filePath.data.file_paths[0]);
          tempImage.value = URL.createObjectURL(value);
        } finally {
          loading.value = false;
        }
      }
    }

    function removePhoto() {
      props.field.value = undefined;
      tempImage.value = '';
    }

    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      onChange,
      getFullPath,
      getFileName,
      loading,
      props,
      removePhoto,
      getFullSmallPath,
      suitableFileExts,
      suitableMimeTypes,
      disableDragAndDrop,
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
  bottom: 20px;
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
