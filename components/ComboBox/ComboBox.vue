<template>
    <v-combobox
      :items="items"
      :search-input.sync="newSearchValue"
      :value="multiple ? selectedModels : selectedModel"
      @change="$emit('change', $event)"
      hide-no-data
      hide-selected
      :small-chips="multiple"
      :item-value="itemInfo.value"
      :item-text="itemInfo.text"
      :placeholder="placeholder"
      :readonly="readonly || disableSearch"
      :clearable="clearable"
      :label="label"
      :multiple="multiple"
      :rules="rules"
      :append-icon="readonly ? '' : 'mdi-menu-down'"
      :error="errorMessages.length > 0"
      :error-messages="errorMessages"
      :color="color"
    >
      <template v-if="multiple" v-slot:selection="{ attrs, item, parent, selected }">
        <v-chip
          v-if="item === Object(item)"
          v-bind="attrs"
          :input-value="selected"
          label
          small
        >
            <span class="pr-2">
              {{ item[itemInfo.text] }}
            </span>
          <v-icon
            small
            @click="parent.selectItem(item)"
          >mdi-close
          </v-icon>
        </v-chip>
      </template>
    </v-combobox>
</template>

<script>
import store from './store'

export default {
    props: {
      // Entity name
      apiModel: {
        required: true,
        type: String
      },
      // Entity target field
      targetField: {
        type: String,
        default: ''
      },
      // Entity current id
      currentValue: {
        default: null
      },
      // Input field placeholder
      placeholder: {
        type: String,
        default: 'Вводите для поиска'
      },
      // Input field label
      label: {
        type: String,
        default: ''
      },
      // Show clear input field button
      clearable: {
        type: Boolean,
        default: true
      },
      // Multiple select
      multiple:{
        type: Boolean,
        default: false
      },
      //Validation rules
      rules: {
        type: Array,
        default() {
          return []
        }
      },
      errorMessages: {
        type: Array,
        default() {
          return []
        }
      },
      readonly: {
        type: Boolean,
        default: false
      },
      color: {
        type: String,
        default: 'primary'
      },
      disableSearch: {
        type: Boolean,
        default: false
      }
    },
    beforeCreate() {
      this.$store = store();
    },
    async created() {
      // получаем данные компонента
      await this.$store.dispatch('createComponent', {
        apiModel: this.apiModel
      });
      // If has current value, load it
      if (this.currentValue) {
        await this.$store.dispatch('loadCurrentValue', {currentValue: this.currentValue, multiple: this.multiple });
      }
    },
    data() {
      return {
        newSearchValue: null
      }
    },
    computed: {
      items() {
        return this.$store.getters['getItems']
      },
      itemInfo() {
        return this.$store.getters['getItemInfo']
      },
      selectedModel() {
        return this.$store.getters['getSelectedModel']
      },
      selectedModels() {
        return this.$store.getters['getSelectedModels']
      }
    },
    watch: {
      async currentValue(newValue){
        if(newValue){
          await this.$store.dispatch('loadCurrentValue', {currentValue: this.currentValue, multiple: this.multiple });
        }
      },
      newSearchValue(newValue) {
        this.$store.dispatch('loadItems', newValue)
      },
    }
  }
</script>

<style scoped>

</style>
