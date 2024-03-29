<template>
  <div class="c-grid-icon-column">
    <!-- Use this slot to set the header caption -->
    <slot />
  </div>
</template>

<script>
  import LayoutColumnMixin from './c-grid/LayoutColumnMixin.vue'
  import StdColumnMixin from './c-grid/StdColumnMixin.vue'
  import {cheetahGrid, extend, gridUpdateWatcher, normalizeAction} from './c-grid/utils'

  /**
 * Defines icon column.
 * @mixin column-mixin
 * @mixin layout-column-mixin
 * @mixin std-column-mixin
 */
export default {
  name: 'CGridIconColumn',
  mixins: [LayoutColumnMixin, StdColumnMixin],
  props: {
    /**
     * Defines an icon tag name
     */
    iconTagName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon class name
     */
    iconClassName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon content
     */
    iconContent: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon name
     */
    iconName: {
      type: [String, Function],
      default: undefined
    },
    /**
     * Defines an icon width
     */
    iconWidth: {
      type: [Number, String, Function],
      default: undefined
    },
    /**
     * Defines an action
     */
    action: {
      type: [Object, String, Function],
      default: undefined
    }
  },
  watch: {
    iconTagName: gridUpdateWatcher,
    iconClassName: gridUpdateWatcher,
    iconContent: gridUpdateWatcher,
    iconName: gridUpdateWatcher,
    iconWidth: gridUpdateWatcher,
    action: gridUpdateWatcher
  },
  methods: {
    /**
     * @private
     */
    createColumn () {
      const columnType = new cheetahGrid.columns.type.IconColumn({
        tagName: this.iconTagName,
        className: this.iconClassName,
        content: this.iconContent,
        name: this.iconName,
        iconWidth: this.iconWidth
      })
      const action = normalizeAction(this.action)

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
.c-grid-icon-column {
  display: none;
}
</style>
