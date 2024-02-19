<template>
  <v-card ref="catchForm">
    <div v-if="!disableDragAndDrop" id="drop-mask" ref="catchMask" class="justify-center align-center">
      {{ calcTitle }}
    </div>
    <slot name="catchPanel" />
  </v-card>
</template>

<script lang="ts">
import {suitableTransferItem} from '~/framework/drag-and-drop-controls/catch-control-consts';

export default defineComponent({
  name: 'catch-control',

  props: {
    dropTitle: {
      type: String,
      default: 'Теперь просто отпустите кнопку мыши.',
    },
    multiFile: {
      type: Boolean,
      default: false,
    },
    disableDragAndDrop: {
      type: Boolean,
      default: false,
    },
    suitableTypes: {
      type: Array as PropType<string[]>,
    },
  },

  setup(props, {emit}) {
    const catchForm: Ref<any> = ref(null);
    const catchMask: Ref<any> = ref(null);
    const errorTitle: Ref<string> = ref('');

    const calcTitle = computed(() => errorTitle.value || props.dropTitle);

    function dragOverHandler(event: Event) {
      const dataTransfer = (event as any).dataTransfer;
      let fileCount = 0;
      for (const item of dataTransfer.items) {
        if (suitableTransferItem(item, props.suitableTypes)) {
          fileCount += 1;
        }
      }
      event.preventDefault();
      if (fileCount === 0) {
        errorTitle.value = 'Нет подходящих файлов!';
      } else if (!props.multiFile && fileCount > 1) {
        errorTitle.value = 'Только один файл!';
      } else {
        errorTitle.value = '';
      }
      catchForm.value.$el.classList.add('dragging-over');
    }

    function dragLeaveHandler() {
      catchForm.value.$el.classList.remove('dragging-over');
    }

    // {kind: 'file', type: 'application/pdf'}

    function catchFile(dataTransfer: any) {
      catchForm.value.$el.classList.remove('dragging-over');
      const filesList: any[] = [];
      if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
        for (const item of dataTransfer.items) {
          if (suitableTransferItem(item, props.suitableTypes)) {
            filesList.push(item.getAsFile());
          }
        }
        emit('catchFilesList', !props.multiFile && filesList.length > 1 ? [] : filesList);
      }
    }

    function dropHandler(event: Event) {
      event.preventDefault();
      catchFile((event as any).dataTransfer);
    }

    function isDragAndDropCapable() {
      const div = document.createElement('div');
      return (
        !props.disableDragAndDrop &&
        'ondrop' in div &&
        'ondragleave' in div &&
        'ondragover' in div &&
        'FormData' in window &&
        'FileReader' in window
      );
    }

    function initDragAndDrop() {
      if (catchForm.value && catchMask.value) {
        catchForm.value.$el.addEventListener('dragover', dragOverHandler);
        catchMask.value.addEventListener('dragleave', dragLeaveHandler);
        catchMask.value.addEventListener('drop', dropHandler);
      }
    }

    onMounted(() => {
      if (isDragAndDropCapable()) {
        initDragAndDrop();
      }
    });

    return {
      catchForm,
      catchMask,
      calcTitle,
    };
  },
});
</script>

<style media="screen">
#drop-mask {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 99;
  display: none;
}

.dragging-over #drop-mask {
  display: flex;
  background-color: lightgrey;
}
</style>
