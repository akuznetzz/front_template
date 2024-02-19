<template>
  <div align="center">
    <v-container>
      <v-flex :row="isRow">
        <div :class="isRow ? 'sliderNavPrevRow' : 'sliderNavPrevColumn'">
          <a v-if="isRow" @click="prevSlide()">
            <div class="ma-1 grey lighten-2" align="center" :style="`width: ${imageSize}px; height: 25px`">
              <v-icon :color="sliderPrev ? 'primary' : 'grey'">mdi-chevron-left </v-icon>
            </div>
          </a>
          <a v-else @click="prevSlide()">
            <div class="ma-1 grey lighten-2" align="center" :style="`width: ${imageSize}px; height: 25px`">
              <v-icon :color="sliderPrev ? 'primary' : 'grey'">mdi-chevron-up </v-icon>
            </div>
          </a>
        </div>
        <v-flex :row="isRow" class="slider_body" :style="sliderSize()">
          <v-flex
            v-if="sliderList.length > 0"
            :row="isRow"
            class="slider_wrapper"
            :style="isRow ? {left: sliderOffset + 'px'} : {top: sliderOffset + 'px'}"
          >
            <v-img
              v-for="slide in sliderList"
              :key="slide.id"
              style="border: 1px solid #7f828b"
              :src="slide.src"
              aspect-ratio="1"
              class="ma-1 grey lighten-2"
              :max-width="imageSize"
              :max-height="imageSize"
              :min-width="imageSize"
              :main-height="imageSize"
              @click="chooseSlide(slide)"
              @mouseover="selectSlide(slide)"
              @mouseleave="selectSlide(selectedSlide)"
              @wheel.prevent="wheel"
            >
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary" />
                </v-row>
              </template>
            </v-img>
          </v-flex>
        </v-flex>
        <div :class="isRow ? 'sliderNavNextRow' : 'sliderNavNextColumn'">
          <a v-if="isRow" @click="nextSlide()">
            <div class="ma-1 grey lighten-2" align="center" :style="`width: ${imageSize}px; height: 25px`">
              <v-icon :color="sliderNext ? 'primary' : 'grey'"> mdi-chevron-right </v-icon>
            </div>
          </a>
          <a v-else @click="nextSlide()">
            <div class="ma-1 grey lighten-2" align="center" :style="`width: ${imageSize}px; height: 25px`">
              <v-icon :color="sliderNext ? 'primary' : 'grey'"> mdi-chevron-down </v-icon>
            </div>
          </a>
        </div>
      </v-flex>
    </v-container>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: 'ActionsTable',
  props: {
    isRow: {
      default: true,
    },
    thumbsCount: {
      type: Number,
      default: 3,
    },
    // Список изображений массив объектов обязательные поля{id:1, src:'someUrl'}
    sliderList: {
      type: Array,
      default: () => [],
    },
    imageSize: {
      type: Number,
      default: 125,
    },
  },
  setup(props, {emit}) {
    const sliderAllCount = ref(0);
    const sliderActive = ref(1);
    const sliderOffset = ref(0);
    const sliderOffsetStep = ref(130);
    const sliderPrev = ref(true);
    const sliderNext = ref(true);
    const selectedSlide: any = ref(null);

    onMounted(() => {
      initSlider();
    });

    function wheel(event: any) {
      if (event.deltaY < 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    function sliderSize() {
      const str: any = {};
      const size = props.thumbsCount * props.imageSize + (props.thumbsCount - 1) * 5;
      if (props.isRow) {
        str['max-width'] = size + 'px';
        str['min-width'] = size + 'px';
      } else {
        str['max-height'] = size + 'px';
        str['min-height'] = size + 'px';
      }
      return str;
    }

    function initSlider() {
      if (sliderAllCount.value <= props.thumbsCount) {
        sliderNext.value = sliderPrev.value = false;
      }
      if (props.sliderList.length === 0) {
        return;
      }
      selectedSlide.value = props.sliderList[0];
      sliderOffset.value = 0;
      sliderNext.value = sliderPrev.value = true;
      sliderAllCount.value = props.sliderList.length;
      if (sliderAllCount.value <= props.thumbsCount) {
        sliderNext.value = sliderPrev.value = false;
      }
      if (sliderActive.value === 1) {
        sliderPrev.value = false;
      }
      selectSlide(selectedSlide.value);
    }

    function selectSlide(slide: any) {
      emit('select', slide);
    }

    function chooseSlide(slide: any) {
      selectedSlide.value = slide;
      selectSlide(selectedSlide.value);
    }

    function openSlide(id: number) {
      if (id > 0 && id <= sliderAllCount.value - props.thumbsCount + 1) {
        sliderActive.value = id;
        sliderOffset.value = -(sliderActive.value * sliderOffsetStep.value - sliderOffsetStep.value);
      }
      sliderPrev.value = sliderActive.value !== 1;
      sliderNext.value = sliderActive.value !== sliderAllCount.value - props.thumbsCount + 1;
    }

    function nextSlide() {
      if (sliderActive.value < sliderAllCount.value - props.thumbsCount + 1) {
        sliderActive.value += 1;
        openSlide(sliderActive.value);
      }
    }

    function prevSlide() {
      if (sliderActive.value > 1) {
        sliderActive.value -= 1;
        openSlide(sliderActive.value);
      }
    }

    watch(
      () => props.sliderList,
      () => {
        initSlider();
      },
    );

    return {
      sliderSize,
      selectSlide,
      sliderOffset,
      sliderNext,
      sliderPrev,
      selectedSlide,
      chooseSlide,
      wheel,
      nextSlide,
      prevSlide,
    };
  },
});
</script>

<style lang="scss" scoped>
.sliderNavPrevRow {
  padding-right: 15px;
}

.sliderNavNextRow {
  padding-left: 15px;
}

.sliderNavPrevColumn {
  padding-bottom: 0px;
}

.sliderNavNextColumn {
  padding-top: 4px;
}

.slider_body {
  position: relative;
  overflow: hidden;
  align-items: stretch;
}

.slider_wrapper {
  left: 0px;
  top: 0px;
  position: relative;
  flex-wrap: nowrap;
  justify-content: start;
  transition: all 0.5s ease;
}
</style>
