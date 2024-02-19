<template>
  <v-container>
    <photo-gallery
      :image-data-source="imageDataSource"
      class="mt-2"
      :readonly="true"
      :selection="true"
      :selection-ids="selectedPhotoIdsOnStart"
      @selectionChanged="changeIds"
    >
      <template slot="servicePanel">
        <service-panel-button
          class="mr-1 mb-2"
          icon-name="mdi-layers-plus"
          color="secondary"
          caption="Принять"
          @click="acceptClicked()"
        />
      </template>
    </photo-gallery>
  </v-container>
</template>

<script lang="ts">
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import {performDRestRequest} from '~/common/drest-request';
import {Filter} from '~/common/filters';
import PhotoGallery from '~/components/photo-gallery/photo-gallery.vue';
import {buildImageDataSource} from '~/components/photo-gallery/utils';
import {extractEntitySpec} from '~/framework/data-source-helper';
import ServicePanelButton from '~/components/SmartTable/ServicePanelButton.vue';

export default defineComponent({
  name: 'PhotoMultiChoice',

  components: {
    PhotoGallery,
    ServicePanelButton,
  },
  props: {
    apiModel: {
      type: String,
      required: true,
    },
    selectedPhotoIdsOnStart: {
      type: Array as PropType<number[]>,
      required: true,
    },
    filter: {
      type: Object as PropType<Filter>,
      required: true,
    },
  },

  setup(props, {emit}) {
    const root = getCurrentInstance().proxy;
    const imageDataSource: any = ref([]);
    let selectedPhotoIds = new Set(props.selectedPhotoIdsOnStart);

    onMounted(() => {
      getAllPhotos();
    });

    async function getAllPhotos(): Promise<any> {
      imageDataSource.value = [];
      const res = await performDRestRequest((root as any).$domainModel, props.apiModel, {filters: [props.filter]});
      for (const r of res.mainModels) {
        const ds = await buildImageDataSource(await extractEntitySpec(root, props.apiModel), r.id);
        ds.readOnly = true;
        imageDataSource.value.push(ds);
      }
    }

    function acceptClicked() {
      emit('closeContext', {modalResult: ModalResult.Accepted, payload: {primaryKey: Array.from(selectedPhotoIds)}});
    }

    function changeIds(ids: Set<number>) {
      selectedPhotoIds = ids;
    }

    return {acceptClicked, imageDataSource, changeIds};
  },
});
</script>

<style scoped></style>
