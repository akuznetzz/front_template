<template>
  <div class="popup-area">
    <slot />
    <v-menu
      v-if="popupImage.src"
      v-model="popupImage.show"
      :position-x="mouseX + 10"
      :position-y="mouseY + 10"
      absolute
      bottom
    >
      <v-img :max-height="150" :max-width="150" :src="popupImage.src" contain @error="onImgError">
        <template #placeholder>
          <v-row align="center" class="fill-height ma-0" justify="center">
            <v-progress-circular color="primary" indeterminate />
          </v-row>
        </template>
      </v-img>
    </v-menu>
  </div>
</template>

<script lang="ts">
import {EDEvent, installEventHandler} from '~/framework/core/enhanced-delegation';
import {getSmartTableMouseEnterCellId, getSmartTableMouseParameters} from '~/components/SmartTable/smart-table-events';

export default defineComponent({
  props: {
    field: {
      type: [String, Array],
      required: true,
    },
    getImage: {
      type: Function,
      required: true,
    },
  },
  setup(props, {slots}) {
    const mouseX = ref(0);
    const mouseY = ref(0);
    let currentRecord: number;
    let currentColumn: string;
    const smartTable: Ref = ref(null);

    const popupImage: any = reactive({
      show: false,
      src: '',
    });

    async function showImagePopup(event: EDEvent) {
      await event.passEvent();
      const params = event.parameters as getSmartTableMouseParameters;
      const record = smartTable.value.$refs.grid.rawGrid.getRowRecord(params.row);
      const column =
        smartTable.value.tableNeedColumns[Number(params.col) - (smartTable.value.templateConf.selections ? 1 : 0)];
      if (currentRecord === record?.id && currentColumn === column?.field) {
        return;
      }
      currentRecord = record?.id;
      currentColumn = column?.field;

      const fields = Array.isArray(props.field) ? props.field : [props.field];
      if (fields.includes(column?.field) && record?.id) {
        popupImage.show = true;
        popupImage.src = await (props.getImage as any)(record.id, column.field);
      } else {
        popupImage.show = false;
      }
    }

    function mouseMove(event: any) {
      mouseX.value = event.clientX;
      mouseY.value = event.clientY;
    }

    onMounted(() => {
      if (slots) {
        smartTable.value = (<any>slots).default()[0].componentInstance;
        smartTable.value.$el.addEventListener('mousemove', mouseMove);
        installEventHandler(smartTable.value.instance, getSmartTableMouseEnterCellId, showImagePopup);
      }
    });

    function onImgError() {
      popupImage.src = '';
    }

    return {
      popupImage,
      mouseX,
      mouseY,
      onImgError,
    };
  },
});
</script>

<style scoped>
.popup-area {
  width: 100%;
  height: 100%;
  position: relative !important;
}
</style>
