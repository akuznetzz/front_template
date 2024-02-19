<template>
  <div v-if="haveToShow" class="d-flex flex-column">
    <div style="display: inline-block; width: 100%">
      <pdf v-for="i in pageCount" :key="i" :page="i" :src="source" />
    </div>
  </div>
  <div v-else class="pa-2">Файл отсутствует или не может быть открыт.</div>
</template>

<script lang="ts">
import {appEventList} from '~/framework/core/app-event-list';
import {EDEvent, installEventHandler, removeEventHandler} from '~/framework/core/enhanced-delegation';
import {unhandledRejectionError} from '~/framework/errorBoundary.vue';

const pdf = require('vue-pdf').default;

export default defineComponent({
  name: 'PDFViewer',
  components: {pdf},
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const haveToShow: any = ref(Boolean(props.src));
    const pageCount: any = ref(0);

    let source = pdf.createLoadingTask(props.src);
    const h = (event: EDEvent) => {
      event.done = true;
    };
    onMounted(async () => {
      installEventHandler(appEventList, unhandledRejectionError, h);

      if (haveToShow) {
        try {
          source = await source.promise;
        } catch (err) {
          haveToShow.value = false;
          throw err;
        }
        pageCount.value = source.numPages;
      }
    });

    onUnmounted(() => {
      removeEventHandler(appEventList, unhandledRejectionError, h);
    });

    return {
      haveToShow,
      pageCount,
      source,
    };
  },
});
</script>
