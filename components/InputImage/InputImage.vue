<template>
  <div>
    <a style="display:none" :href="img || defaultImage" :download="imgName" target="_blank" ref="imageDownload">test</a>
    <v-file-input v-show="!(img || defaultImage)"
      :label="label"
      :accept="accept"
      show-size
      :prepend-icon="icon"
      @change="loadImg"
      :clearable="false"
      :disabled="disabled"
      :loading="loading"
    />
    <input type="file" @change="loadImg" style="display: none;" :accept="accept" ref="imageUploadHidden" />
    <v-card v-if="img || defaultImage" class="hover-for-controls"
      align="center" justify="center" :style="'height: '+maxHeight"
    >
      <img :src="img || smallImageURL || defaultImage" class="image-small-pre" />
      <label class="image-label">
        {{ label }}
      </label><br>
      <v-row justify="center" class="affect-controls">
        <v-menu open-on-hover top offset-y>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" small title="Развернуть" class="mr-2">
              <v-icon>mdi-arrow-expand-all</v-icon>
            </v-btn>
          </template>
          <v-card style="max-width: 800px;">
            <img :src="img || defaultImage" class="image-big-pre" />
          </v-card>
        </v-menu>
        <v-btn small title="Сохранить" class="mr-2" @click="$refs.imageDownload.click()">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn small title="Загрузить" @click="openImage()" :disabled="disabled">
          <v-icon>mdi-upload</v-icon>
        </v-btn>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import store from './store';
import {httpPost} from '~/framework/httpRequest';
import {UPLOAD_URL} from '~/common/constants';

export default {
  props: {
    label: {},
    model: { required: true },
    icon: {},
    type: { default: 'file' },
    accept: { default: '*' },
    defImage: {},
    smallImage: {},
    maxHeight: {},
    disabled: {},
    error:{
      default: false
    },
    rule: {
      default: true
    }
  },
  data() {
    return {
      loading: false,
      defaultImage: ''
    }
  },
  beforeCreate() {
    this.$store = store();
  },
  methods: {
    async loadImg(value) {
      if (typeof value === 'string' && value.startsWith('upload/')) {
        return;
      }
      if (value) {
        this.defaultImage = '';
        if (value?.target) {
          value = value.target.files[0] || value.dataTransfer.files[0];
        }
        this.loading = true;
        try {
          const formData = new FormData();
          formData.append('files', value, value.name);
          const filePath = await httpPost(UPLOAD_URL, formData);
          this.img = URL.createObjectURL(value);
          this.imgName = value.name;
          this.$emit('update:model', filePath.data.file_paths[0]);
        } finally {
          this.loading = false;
        }
      } else {
        this.img = '';
      }
    },
    openImage() {
      this.$refs.imageUploadHidden.click();
    }
  },
  computed: {
    img: {
      get () {
        return this.$store.getters.getImg;
      },
      set (v) {
        this.$store.commit('setProp', { name: 'img', value: v });
      }
    },
    imgName: {
      get () {
        return this.$store.getters.getImgName;
      },
      set (v) {
        this.$store.commit('setProp', { name: 'imgName', value: v });
      }
    },
    smallImageURL () {
      return this.$store.getters.getSmallImageURL;
    }
  },
  created() {
    if(this.model){
      this.loadImg(this.model);
    }
    if (this.defImage) {
      this.defaultImage = this.defImage;
      this.imgName = this.defaultImage.split('/').pop();
    }
    if (this.smallImage) {
      this.$store.commit('setProp', { name: 'smallImage', value: this.smallImage });
    }
  }
}
</script>

<style>
.hover-for-controls:hover .affect-controls {
  opacity: 0.5;
}
.affect-controls {
  opacity: 0;
  position: absolute;
  bottom: 10px;
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
