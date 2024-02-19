<template>
  <v-dialog max-width="65vw">
    <template v-slot:activator="{ on }">
      <v-row dense >
        <v-col
          v-for="(photo, index) of photos"
          :key="photo.id"
          :cols="cols"
          :md="col"
          :align="align"
          :justify="justify"
        >
          <img
            class="img"
            :src="photo.photo"
            v-on="on"
            @click="activePhoto = index"
          >
        </v-col>
      </v-row>
    </template>
    <v-card
    >
      <v-carousel
        v-model="activePhoto"
        touchless
        hide-delimiters
        cycle
      >
        <v-carousel-item
          v-for="photo of photos"
          :key="photo.id"
        >
          <img
            class="active-image"
            :src="photo.photo"
          >
        </v-carousel-item>
      </v-carousel>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    photos: {
      type: Array,
      default: function () {
        return []
      },
    },
    cols: {
      type: Number,
      default: 12,
    },
    col: {
      type: Number,
      default: 6,
    },
    justify: {
      type: String,
    },
    align: {
      type: String,
    },
  },
  data () {
    return {
      activePhoto: 0,
    }
  },
}
</script>

<style lang="sass">
  .img
    cursor: pointer
    width: 100%

  .active-image
    height:  100%
    width: auto
    margin: auto
    display: block
</style>
