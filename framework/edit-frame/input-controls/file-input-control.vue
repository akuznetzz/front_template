<template>
  <catch-control
    :drop-title="dropTitle"
    :suitable-types="suitableMimeTypes"
    :disable-drag-and-drop="props.field.refReadOnly.value"
    @catchFilesList="onChange"
  >
    <template v-slot:catchPanel>
      <a v-show="false" ref="fileDownload" :href="getFullPath" :download="getFileName" target="_blank" />
      <!-- readonly changed to disabled, because readonly not supported in v-file-input -->
      <v-file-input
        :label="label"
        :disabled="props.field.refReadOnly.value"
        :hint="props.field.refReadOnly.value ? '' : 'Выберите файл'"
        :rules="rules"
        validate-on-blur
        :loading="loading"
        :accept="acceptFileFormat"
        :value="getValue"
        @change="onChange"
      >
        <v-btn
          v-if="getFileName && !props.field.changed"
          slot="append-outer"
          icon
          small
          title="Скачать файл"
          class="unlocked"
          @click="$refs.fileDownload.click()"
        >
          <v-icon>mdi-file-download</v-icon>
        </v-btn>
      </v-file-input>
    </template>
  </catch-control>
</template>

<script lang="ts">
import {fieldValueFromString} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {httpPost, httpGet, httpPut} from '~/framework/httpRequest';
import {UPLOAD_URL, DIRECT_UPLOAD_LINK_GETTER_URL} from '~/common/constants';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';
import CatchControl from '~/framework/drag-and-drop-controls/catch-control.vue';
import {loadFileTypesDef} from '~/framework/drag-and-drop-controls/catch-control-consts';

export default defineComponent({
  name: 'FileInputControl',

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
    },
  },

  setup(props) {
    const rules = useRequiredRule(props.field.spec);
    const loading = ref(false);

    const getFullPath = computed(() => (props.field.value ? props.field.value.asString() : undefined));

    const getFileName = computed(() =>
      getFullPath.value ? decodeURIComponent(getFullPath.value.split('/').pop() as string) : undefined,
    );

    const getValue = computed(() =>
      getFileName.value ? new File([''], getFileName.value, {type: 'text/plain'}) : undefined,
    );

    const acceptFileFormat = computed(() => {
      const extra = props.field.extra;
      let fileExts;
      if (extra?.acceptFileFormat) {
        if (Object.keys(loadFileTypesDef).includes(extra.acceptFileFormat)) {
          fileExts = loadFileTypesDef[extra.acceptFileFormat].fileExts;
        } else {
          fileExts = extra.acceptFileFormat.split(' ');
        }
      }
      return fileExts ? fileExts.map((extension: string) => `.${extension}`).join(',') : '*.*';
    });

    const suitableMimeTypes = computed(() => {
      const extra = props.field.extra;
      return extra?.acceptFileFormat && Object.keys(loadFileTypesDef).includes(extra.acceptFileFormat)
        ? loadFileTypesDef[extra.acceptFileFormat].mimeTypes
        : undefined;
    });

    async function onChange(value: any) {
      if (!value) {
        props.field.value = undefined;
        return;
      }
      if (value instanceof FileList || value instanceof Array) {
        value = value[0];
      }
      if (!value) {
        return;
      }
      // FIXME: after update Vuetify, currently blur detecting as changed event.
      // https://github.com/vuetifyjs/vuetify/issues/8167.
      // remove size validation and change 'else if' to 'else'.
      if (value && value.size) {
        loading.value = true;
        try {
          if (props.field.spec?.type == 'file direct upload') {
            // process 'file direct upload' type field behavior
            const linkGetterResponse = await httpGet(DIRECT_UPLOAD_LINK_GETTER_URL, {
              params: {
                file_name: value.name,
                upload_to: props.field.spec.upload_to,
              },
            });

            if (linkGetterResponse.data.error) {
              throw linkGetterResponse.data.error;
            } else {
              await httpPut(linkGetterResponse.data.link, value, {
                headers: {
                  'Content-Type': 'multipart/octet-stream',
                  'X-Delete-After': '3600',
                },
              });
              props.field.value = fieldValueFromString(linkGetterResponse.data.path);
            }
          } else {
            // process any other file type fields
            const formData = new FormData();
            formData.append('files', value, value.name);
            const filePath = await httpPost(UPLOAD_URL, formData);
            props.field.value = fieldValueFromString(filePath.data.file_paths[0]);
          }
        } finally {
          loading.value = false;
        }
      }
    }

    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      onChange,
      getValue,
      getFullPath,
      getFileName,
      loading,
      props,
      acceptFileFormat,
      suitableMimeTypes,
    };
  },
});
</script>

<style scoped>
.unlocked {
  pointer-events: auto;
}
</style>
