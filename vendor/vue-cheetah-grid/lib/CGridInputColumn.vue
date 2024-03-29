<template>
  <div class="c-grid-input-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
  import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
  import StdColumnMixin from './c-grid/StdColumnMixin.vue'
  import {cheetahGrid, extend, gridUpdateWatcher, normalizeColumnType} from './c-grid/utils'

  /**
 * Defines input column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridInputColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines a column type
     */
    columnType: {
      type: [Object, String, Function],
      default: undefined
    },
    /**
     * Defines a helper text ganarator
     */
    helperText: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an input validator
     */
    inputValidator: {
      type: [Function],
      default: undefined
    },
    /**
     * Defines a validator
     */
    validator: {
      type: [Function],
      default: undefined
    },
    /**
     * Defines an input class name
     */
    inputClassList: {
      type: [Array, String, Function],
      default: undefined
    },
    /**
     * Defines an input type
     */
    inputType: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines disabled
     */
    disabled: {
      type: [Boolean, Function],
      default: false
    },
    /**
     * Defines readonly
     */
    readonly: {
      type: [Boolean, Function],
      default: false
    }
  },
  watch: {
    columnType: gridUpdateWatcher,
    helperText: gridUpdateWatcher,
    inputValidator: gridUpdateWatcher,
    validator: gridUpdateWatcher,
    inputClassList: gridUpdateWatcher,
    inputType: gridUpdateWatcher,
    disabled (disabled) {
      if (this._action) {
        this._action.disabled = disabled
      }
    },
    readonly (readonly) {
      if (this._action) {
        this._action.readOnly = readonly
      }
    }
  },
  methods: {
    /**
     * @private
     * @override
     */
    getPropsObjectInternal () {
      const props = LayoutColumnMixin.methods.getPropsObjectInternal.apply(this)
      delete props.disabled
      delete props.readonly
      return props
    },
    /**
     * @private
     */
    createColumn () {
      const action = this._action = new cheetahGrid.columns.action.SmallDialogInputEditor({
        helperText: this.helperText,
        inputValidator: this.inputValidator,
        validator: this.validator,
        classList: this.inputClassList,
        type: this.inputType,
        disabled: this.disabled,
        readOnly: this.readonly
      })
      const columnType = normalizeColumnType(this.columnType)

      const baseCol = LayoutColumnMixin.methods.createColumn.apply(this)
      const stdCol = StdColumnMixin.methods.createColumn.apply(this)
      return extend(
        baseCol,
        stdCol,
        {
          caption: this.caption || this.$el.textContent.trim(),
          columnType,
          action
        }
      )
    }
  }
}
</script>

<style scoped>
.c-grid-input-column {
  display: none;
}
</style>
