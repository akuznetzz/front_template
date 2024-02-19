<template>
  <catch-control
    :multi-file="true"
    :suitable-types="suitableMimeTypes"
    :disable-drag-and-drop="disableDragAndDrop"
    @catchFilesList="multipleUploadImage"
  >
    <template v-slot:catchPanel>
      <strong>
        {{ title }}
      </strong>
      <slot name="servicePanel" />
      <v-row>
        <v-col v-for="(image, index) in imageDataSource" :key="index" cols="3">
          <v-card class="pa-1 ma-1">
            <v-row>
              <v-col cols="12">
                <edit-frame :field="image.fieldByName(imageFieldName)" :extra="{disableDragAndDrop: true}" />
              </v-col>
              <template v-for="field in image.fields">
                <v-col v-if="allowedFields(field.name)" :key="field.name" cols="12" class="py-0">
                  <edit-frame :field="field" />
                </v-col>
              </template>
            </v-row>
            <div v-if="selection" style="position: absolute; left: 14px; top: 5px">
              <v-checkbox
                :input-value="isSelected(image.fieldByName('id').value.asNumber())"
                color="success"
                @change="select(image.fieldByName('id').value.asNumber(), ...arguments)"
              />
            </div>
            <div style="position: absolute; right: 14px; top: 14px">
              <v-btn
                v-if="!readonly && saveButton"
                icon
                color="primary"
                title="Сохранить"
                outlined
                small
                :disabled="!image.changed"
                @click="saveImage(image)"
              >
                <v-icon>mdi-content-save-outline</v-icon>
              </v-btn>
              <v-btn
                v-if="!readonly"
                icon
                color="error"
                title="Удалить"
                outlined
                small
                :disabled="false"
                @click="removeImage(index)"
              >
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
            </div>
          </v-card>
        </v-col>
        <v-col cols="2">
          <v-btn
            v-if="!readonly"
            icon
            title="Добавить еще фотографию"
            color="success"
            outlined
            small
            @click="addImage()"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            v-if="!readonly"
            icon
            title="Добавить несколько"
            color="secondary"
            outlined
            small
            @click="multipleImage.click()"
          >
            <v-icon>mdi-playlist-plus</v-icon>
          </v-btn>
          <input
            ref="multipleImage"
            hidden
            accept=".png, .jpg, .jpeg"
            type="file"
            :multiple="true"
            @change="multipleUploadImage($event)"
          />
        </v-col>
      </v-row>

      <h4 v-if="imageDataSource.length === 0">{{ $t('editCards.photoGallery.noPhotos') }}</h4>
    </template>
  </catch-control>
</template>

<script lang="ts">
import {confirm, error} from '~/framework/messages';
import EditFrame from '~/framework/edit-frame/edit-frame.vue';
import {performDelete} from '~/common/drest-request';
import {httpPost} from '~/framework/httpRequest';
import {UPLOAD_URL} from '~/common/constants';
import {DataSource} from '~/framework/data-source';
import {fieldValueFromString} from '~/common/FieldValue';
import CatchControl from '~/framework/drag-and-drop-controls/catch-control.vue';
import {loadFileTypesDef} from '~/framework/drag-and-drop-controls/catch-control-consts';

export default defineComponent({
  name: 'PhotoGallery',
  components: {
    EditFrame,
    CatchControl,
  },
  props: {
    title: {
      type: String,
    },
    imageDataSource: {
      type: Array,
      required: true,
    },
    imageFieldName: {
      type: String,
      default: 'photo',
    },
    additionalFields: {
      type: Array,
      default: () => [],
    },
    addImageDataSource: {
      type: Function,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    selection: {
      type: Boolean,
      default: false,
    },
    selectionIds: {
      type: Array,
      default: () => [],
    },
    saveButton: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, {emit}) {
    const selectedForDelete: any = ref({});
    const multipleImage: Ref<any> = ref(null);
    const selectedPhotoIds = new Set(props.selectionIds);
    const disableDragAndDrop = ref(false);

    onMounted(() => {
      disableDragAndDrop.value = props.readonly;
    });

    watch(
      () => props.readonly,
      (readonly) => {
        disableDragAndDrop.value = readonly;
      },
    );

    const suitableMimeTypes = computed(() => {
      return loadFileTypesDef.imageDocFile?.mimeTypes;
    });

    async function addImage(file?: any) {
      const dataSource: DataSource = await (props as any).addImageDataSource();
      if (file) {
        const formData = new FormData();
        formData.append('files', file, file.name);
        try {
          const filePath = await httpPost(UPLOAD_URL, formData);
          dataSource.fieldByName(props.imageFieldName).value = fieldValueFromString(filePath.data.file_paths[0]);
          Object.assign(dataSource.fieldByName(props.imageFieldName), {extra: {tempImage: URL.createObjectURL(file)}});
        } catch (e) {
          error(e.message);
        }
      }
      props.imageDataSource.push(dataSource);
    }

    function removeImage(index: number) {
      selectedForDelete.value = index;
      confirm('Удалить фото?', confirmedRemove);
    }

    async function confirmedRemove() {
      const dataSource = (props as any).imageDataSource[selectedForDelete.value];
      const primaryKeyValue = dataSource.fieldByName('id')?.value?.asNumber();
      if (primaryKeyValue) {
        try {
          await performDelete(dataSource.modelSpec.domainModel, dataSource.entityName, primaryKeyValue);
        } catch (e) {
          error(e.message);
        }
      }
      props.imageDataSource.splice(selectedForDelete.value, 1);
    }

    function multipleUploadImage(event: any) {
      if (!event) {
        return;
      }
      let files;
      if (event?.target) {
        files = event.target.files || event.dataTransfer.files;
      } else if (event instanceof FileList || event instanceof Array) {
        files = event;
      } else {
        files = [event];
      }
      if (!files) {
        return;
      }
      for (const file of files) {
        addImage(file);
      }
    }

    function saveImage(image: any) {
      if (image.validate()) {
        image.save();
      }
    }

    function allowedFields(fldName: string) {
      return props.additionalFields.includes(fldName);
    }

    function isSelected(id: number) {
      return selectedPhotoIds.has(id);
    }

    function select(id: number, value: any) {
      value ? selectedPhotoIds.add(id) : selectedPhotoIds.delete(id);
      emit('selectionChanged', selectedPhotoIds);
    }

    return {
      addImage,
      removeImage,
      multipleImage,
      multipleUploadImage,
      saveImage,
      allowedFields,
      isSelected,
      select,
      disableDragAndDrop,
      suitableMimeTypes,
    };
  },
});
</script>

<style media="screen" />
