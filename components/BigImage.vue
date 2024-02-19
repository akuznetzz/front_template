<template>
  <v-dialog v-model="image.show" max-width="1000">
    <v-card>
      <v-list-item style="background-color: #f6f6f6">
        <v-btn icon @click="rotate">
          <v-icon color="primary"> mdi-rotate-right </v-icon>
        </v-btn>
        <v-btn icon @click="zoomOut">
          <v-icon color="primary"> mdi-magnify-minus-outline </v-icon>
        </v-btn>
        <v-btn icon @click="zoomIn">
          <v-icon color="primary"> mdi-magnify-plus-outline </v-icon>
        </v-btn>
        <v-spacer />
        <v-btn icon @click="image.show = false">
          <v-icon color="primary"> mdi-close </v-icon>
        </v-btn>
      </v-list-item>
      <div class="response-div">
        <div :style="`width: ${width}px`">
          <v-img :class="currentClass" :src="image.src" />
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    image: {
      type: Object,
    },
  },
  setup(props) {
    let angle = 0;
    const currentClass = ref('rotate0');
    const width = ref(1000);

    function rotate() {
      angle = (angle + 90) % 360;
      currentClass.value = `rotate${angle}`;
    }

    watch(
      () => props.image?.show,
      () => {
        currentClass.value = 'rotate0';
        angle = 0;
        width.value = 1000;
      },
    );

    function zoomOut() {
      width.value -= 100;
      console.log(width.value);
    }

    function zoomIn() {
      width.value += 100;
    }

    onMounted(() => {
      window.addEventListener('keydown', onKeyDown);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', onKeyDown);
    });

    function onKeyDown(e: any) {
      if (e.key === '+') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      }
    }

    return {
      rotate,
      currentClass,
      width,
      zoomOut,
      zoomIn,
    };
  },
});
</script>

<style scoped>
.rotate0 {
  transform-origin: top left;
  -webkit-transform-origin: top left;
  -ms-transform-origin: top left;
}

.rotate90 {
  transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
}

.rotate180 {
  transform: rotate(180deg);
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
}

.rotate270 {
  transform: rotate(270deg);
  -webkit-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
}
.response-div {
  width: 1000px;
  height: 600px;
  overflow: scroll;
}
</style>
