<template>
  <div>
    <v-autocomplete
      @change="passToParent"
      @keydown.native.arrow-down="loadSomeItems()"
      :value="model"
      :items="items"
      :search-input.sync="search"
      hide-no-data
      :item-text="itemText"
      item-value="id"
      :label="label"
      hint="Введите для поиска"
      :rules="rules"
      :disabled="disabled"
      validate-on-blur
      clearable
      return-object />
  </div>
</template>

<script>
import store from './store'

export default {
  props: {
    model: {
      required: true
    },
    rules: {},
    currentItem: {},
    disabled: {},
    label: {},
    placeholder: {},
    APIRequest: {},
    itemText: {
      default: 'name'
    }
  },
  beforeCreate() {
    this.$store = store();
  },
  methods: {
    passToParent(v) {
      this.$emit('update:model', v);
    },
    loadItems(v) {
      this.$store.dispatch('loadItems', v);
    },
    loadSomeItems() {
      if (this.items.length < 1) {
        this.loadItems('');
      }
    },
    loadDefaultValue() {
      this.$store.dispatch('loadDefaultValue', this.currentItem);
    }
  },
  computed: {
    search: {
      get () {
        return this.$store.getters.getSearch;
      },
      set (v) {
        this.$store.commit('setSearch', v);
      }
    },
    items() {
      return this.$store.getters.getItems;
    }
  },
  created() {
    this.$store.commit('setProp', { name: 'APIRequest', value: this.APIRequest});
    this.$store.commit('setProp', { name: 'itemText', value: this.itemText});
    this.loadDefaultValue();
  },
  watch: {
    search (v) {
      if (v) {
        this.loadItems(v);
      }
    },
    currentItem (v) {
      if (v) {
        this.loadDefaultValue();
      }
    }
  },
}
</script>