<template>
  <div class="c-grid">
    <div class="define">
      <!--
        Use this slot to set the simple header definition.
        The definition is set to `header` property described in [Define Headers and Columns]
      -->
      <slot />
      <!--
        Use this slot to set the layout header definition.
        Use this slot in combination with the `layout-body` slot.
        The definition is set to `layout.header` property described in [Advanced Layout].
      -->
      <slot name="layout-header" />
      <!--
        Use this slot to set the layout body definition.
        Use this slot in combination with the `layout-header` slot.
        The definition is set to `layout.body` property described in [Advanced Layout].
      -->
      <slot name="layout-body" />
    </div>
  </div>
</template>

<script>
  import {cheetahGrid, extend, gridUpdateWatcher} from './c-grid/utils'
  import {slotsToHeaderOptions, slotsToHeaderProps} from './c-grid/header-utils'

  const primitives = {
  function: true, string: true, number: true, boolean: true, undefined: true, bigint: true, symbol: true
}
function deepObjectEquals (a, b) {
  if (a === b) {
    return true
  }
  if (typeof a !== typeof b || a == null || b == null ||
    a.constructor !== b.constructor) {
    return false
  }
  if (primitives[typeof a]) {
    return false
  }
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  if (aKeys.length !== bKeys.length) {
    return false
  }
  for (let i = 0; i < aKeys.length; i++) {
    const aKey = aKeys[i]
    const bKey = bKeys[i]
    if (aKey !== bKey) {
      return false
    }
    if (!deepObjectEquals(a[aKey], b[aKey])) {
      return false
    }
  }
  return true
}

function _setGridData (vm, grid, data, filter) {
  const oldDataSource = grid.dataSource && grid.dataSource.dataSource
  const unusedDataSources = new Set(vm._dataSources || [])

  const dataSources = vm._dataSources = []
  let dataSource
  if (Array.isArray(data)) {
    if (oldDataSource && oldDataSource.source === data) {
      oldDataSource.length = data.length
      dataSource = oldDataSource
      unusedDataSources.delete(dataSource)
    } else {
      if (filter) {
        dataSource = cheetahGrid.data.CachedDataSource.ofArray(data)
        dataSources.push(dataSource)
      } else {
        grid.records = data
        return
      }
    }
  } else if (data instanceof cheetahGrid.data.DataSource) {
    dataSource = data
  } else {
    if (oldDataSource && oldDataSource.source === data) {
      oldDataSource.length = data.length
      dataSource = oldDataSource
      unusedDataSources.delete(dataSource)
    } else {
      dataSource = new cheetahGrid.data.CachedDataSource(data)
      dataSources.push(dataSource)
    }
  }
  if (filter) {
    if (dataSource instanceof cheetahGrid.data.FilterDataSource) {
      dataSource.filter = filter
    } else {
      dataSource = new cheetahGrid.data.FilterDataSource(dataSource, filter)
      dataSources.push(dataSource)
    }
  }
  grid.dataSource = dataSource

  unusedDataSources.forEach(dc => dc.dispose())
}
function _bindEvents (vm, grid) {
  const { EVENT_TYPE } = cheetahGrid.ListGrid
  grid.listen(EVENT_TYPE.CHANGED_HEADER_VALUE, (...args) => {
    vm.headerValues = grid.headerValues
  })
  for (const k in EVENT_TYPE) {
    const type = EVENT_TYPE[k]
    const emitType = type.replace(/_/g, '-').toLowerCase()
    grid.listen(type, (...args) => {
      const results = []

      vm.$_CGrid_emit(emitType, ...args, (r) => {
        results.push(r)
      })

      // emit column event
      const [first] = args
      const col = first && first.col != null && typeof first.col === 'number' ? first.col : null
      const row = first && first.row != null && typeof first.row === 'number' ? first.row : null

      if (col != null && grid.colCount > col) {
        if (row != null && grid.frozenRowCount > row) {
          const define = grid.getHeaderDefine(col, row)
          if (define && define.vm) {
            define.vm.$emit(emitType, ...args, (r) => {
              results.push(r)
            })
          }
        } else {
          const define = grid.getColumnDefine(col, row)
          if (define && define.vm) {
            define.vm.$emit(emitType, ...args, (r) => {
              results.push(r)
            })
          }
        }
      }
      return results[0]
    })
  }
}
function _buildGridProps (vm) {
  const headerLayoutOptions = {}
  if (vm.$slots['layout-body']) {
    if (vm.$slots['layout-header']) {
      headerLayoutOptions.layout = {
        header: slotsToHeaderProps(vm, vm.$slots['layout-header']),
        body: slotsToHeaderProps(vm, vm.$slots['layout-body'])
      }
    } else {
      headerLayoutOptions.layout = {
        header: slotsToHeaderProps(vm, vm.$slots['layout-body']),
        body: slotsToHeaderProps(vm, vm.$slots['layout-body'])
      }
    }
  } else {
    headerLayoutOptions.header = slotsToHeaderProps(vm, vm.$slots.default)
  }
  return extend(
    {
      frozenColCount: vm.frozenColCount - 0,
      theme: vm.theme || null
    },
    headerLayoutOptions,
    vm.options
  )
}
function _buildGridOption (vm) {
  const headerLayoutOptions = {}
  if (vm.$slots['layout-body']) {
    if (vm.$slots['layout-header']) {
      headerLayoutOptions.layout = {
        header: slotsToHeaderOptions(vm, vm.$slots['layout-header']),
        body: slotsToHeaderOptions(vm, vm.$slots['layout-body'])
      }
    } else {
      headerLayoutOptions.layout = {
        header: slotsToHeaderOptions(vm, vm.$slots['layout-body']),
        body: slotsToHeaderOptions(vm, vm.$slots['layout-body'])
      }
    }
  } else {
    headerLayoutOptions.header = slotsToHeaderOptions(vm, vm.$slots.default)
  }
  return extend(
    {
      frozenColCount: vm.frozenColCount - 0,
      theme: vm.theme || null,
      headerRowHeight: vm.headerRowHeight,
      allowRangePaste: vm.allowRangePaste,
      defaultRowHeight: vm.defaultRowHeight,
      defaultColWidth: vm.defaultColWidth,
      font: vm.font,
      underlayBackgroundColor: vm.underlayBackgroundColor,
      keyboardOptions: { moveCellOnTab: vm.moveCellOnTabKey },
      disableColumnResize: vm.disableColumnResize
    },
    headerLayoutOptions,
    vm.options
  )
}
function _initGrid (vm) {
  vm._beforeGridProps = _buildGridProps(vm)
  const options = _buildGridOption(vm)
  options.parentElement = vm.$el
  const grid = vm.rawGrid = new cheetahGrid.ListGrid(options)
  _setGridData(vm, grid, vm.data, vm.filter)
  _bindEvents(vm, grid)
}

let seq = 0

/**
 * Defines the Grid.
 */
export default {
  name: 'CGrid',
  provide () {
    return {
      $_CGridInstance: this
    }
  },
  props: {
    /**
     * Defines a records or data source.
     */
    data: {
      type: [Array, Object],
      default: undefined
    },
    /**
     * Defines a frozen col Count
     */
    frozenColCount: {
      type: [Number, String],
      default: 0
    },
    /**
     * Defines the header row height(s)
     */
    headerRowHeight: {
      type: [Number, Array],
      default: undefined
    },
    /**
     * Allow pasting of range.
     */
    allowRangePaste: {
      type: Boolean
    },
    /**
     * Default grid row height.
     */
    defaultRowHeight: {
      type: Number,
      default: undefined
    },
    /**
     * Default grid col width.
     */
    defaultColWidth: {
      type: Number,
      default: undefined
    },
    /**
     * Defines a records filter
     */
    filter: {
      type: [Function],
      default: undefined
    },
    /**
     * Default font.
     */
    font: {
      type: String,
      default: undefined
    },
    /**
     * Underlay background color.
     */
    underlayBackgroundColor: {
      type: String,
      default: undefined
    },
    /**
     * Defines the grid theme
     */
    theme: {
      type: [Object, String],
      default: undefined
    },
    /**
     * Specify `true` to enable cell movement by tab key.
     */
    moveCellOnTabKey: {
      type: Boolean
    },
    /**
     * Specify `true` to disable column resizing
     */
    disableColumnResize: {
      type: Boolean
    },
    /**
     * Defines a raw options for Cheetah Grid
     */
    options: {
      type: Object,
      default: undefined
    }
  },
  data () {
    return {
      /**
       * Header values.
       * @type {object}
       */
      headerValues: {}
    }
  },
  computed: {
  },
  watch: {
    data (data) {
      if (this.rawGrid) {
        _setGridData(this, this.rawGrid, data, this.filter)
      }
    },
    filter (filter) {
      if (this.rawGrid) {
        _setGridData(this, this.rawGrid, this.data, filter)
      }
    },
    frozenColCount (frozenColCount) {
      if (this.rawGrid) {
        this.rawGrid.frozenColCount = frozenColCount
      }
    },
    options: gridUpdateWatcher,
    headerValues: {
      handler (headerValues) {
        this.rawGrid.headerValues = headerValues
      },
      deep: true
    }
  },
  created () {
    this.$_CGrid_defineColumns = []
  },
  mounted () {
    this.$_CGrid_cancelNextTickUpdate()
    if (this.rawGrid) {
      this.rawGrid.dispose()
      this.rawGrid = null
    }
    _initGrid(this)
  },
  destroyed () {
    this.$_CGrid_cancelNextTickUpdate()
    if (this.rawGrid) {
      this.rawGrid.dispose()
      this.rawGrid = null
    }
    if (this._dataSources) {
      this._dataSources.forEach(dc => dc.dispose())
    }
    this.$_CGrid_defineColumns = []
  },
  updated () {
    this.$_CGrid_nextTickUpdate()
  },
  methods: {
    /**
     * Redraws the whole grid.
     * @return {void}
     */
    invalidate () {
      if (this.rawGrid) {
        this.$_CGrid_ifDelayingForceUpdate()
        this.rawGrid.invalidate()
      }
    },
    /**
     * Apply the changed size.
     * @return {void}
     */
    updateSize () {
      if (this.rawGrid) {
        this.$_CGrid_ifDelayingForceUpdate()
        this.rawGrid.updateSize()
      }
    },
    /**
     * Apply the changed scroll size.
     * @return {void}
     */
    updateScroll () {
      if (this.rawGrid) {
        this.$_CGrid_ifDelayingForceUpdate()
        this.rawGrid.updateScroll()
      }
    },
    /**
     * @private
     */
    $_CGrid_nextTickUpdate () {
      const id = ++seq
      this._nextTickUpdateId = id
      this.$nextTick(() => {
        if (this._nextTickUpdateId === id) {
          this.$_CGrid_update()
        }
      })
    },
    /**
     * @private
     */
    $_CGrid_cancelNextTickUpdate () {
      this._nextTickUpdateId = undefined
    },
    /**
     * @private
     */
    $_CGrid_ifDelayingForceUpdate () {
      if (this._nextTickUpdateId) {
        this.$_CGrid_update()
      }
    },
    /**
     * @private
     */
    $_CGrid_update () {
      this.$_CGrid_cancelNextTickUpdate()
      if (this.rawGrid) {
        const gridProps = _buildGridProps(this)
        const beforeGridProps = extend({}, this._beforeGridProps)
        if (deepObjectEquals(beforeGridProps, gridProps)) {
          // optionの変更が無ければ、ここからの操作はしない
          return
        }

        const newProps = extend({}, gridProps)
        delete beforeGridProps.header
        delete newProps.header
        delete beforeGridProps.layout
        delete newProps.layout
        delete beforeGridProps.frozenColCount
        delete newProps.frozenColCount
        delete beforeGridProps.theme
        delete newProps.theme
        delete beforeGridProps.allowRangePaste
        delete newProps.allowRangePaste
        delete beforeGridProps.defaultRowHeight
        delete newProps.defaultRowHeight
        delete beforeGridProps.defaultColWidth
        delete newProps.defaultColWidth
        delete beforeGridProps.underlayBackgroundColor
        delete newProps.underlayBackgroundColor
        delete beforeGridProps.font
        delete newProps.font

        if (deepObjectEquals(beforeGridProps, newProps)) {
          // 操作可能なoptionのみの変更。インスタンス再作成はしない
          const options = _buildGridOption(this)
          const {
            header,
            layout,
            frozenColCount,
            theme,
            allowRangePaste,
            defaultRowHeight,
            defaultColWidth,
            font,
            underlayBackgroundColor
          } = options
          this.rawGrid.header = header
          this.rawGrid.layout = layout
          this.rawGrid.frozenColCount = frozenColCount
          this.rawGrid.theme = theme
          this.rawGrid.allowRangePaste = !!allowRangePaste
          if (defaultRowHeight != null) {
            this.rawGrid.defaultRowHeight = defaultRowHeight
          }
          if (defaultColWidth != null) {
            this.rawGrid.defaultColWidth = defaultColWidth
          }
          this.rawGrid.font = font
          this.rawGrid.underlayBackgroundColor = underlayBackgroundColor
          this.rawGrid.invalidate()
          this._beforeGridProps = extend({}, gridProps)
          return
        }
        this.rawGrid.dispose()
        _initGrid(this)
      }
    },
    /**
     * @private
     */
    $_CGrid_emit (type, ...args) {
      // emit grid event
      switch (type) {
        case 'click-cell':
          /**
           * Click on cell.
           */
          this.$emit('click-cell', ...args)
          break
        case 'dblclick-cell':
          /**
           * Doubleclick on cell.
           */
          this.$emit('dblclick-cell', ...args)
          break
        case 'selected-cell':
          /**
           * Selected cell.
           */
          this.$emit('selected-cell', ...args)
          break
        case 'paste-cell':
          /**
           * Paste on cell.
           */
          this.$emit('paste-cell', ...args)
          break
        case 'changed-value':
          /**
           * Changed value.
           */
          this.$emit('changed-value', ...args)
          break
        case 'changed-header-value':
          /**
           * Changed header value.
           */
          this.$emit('changed-header-value', ...args)
          break
          // TODO others
        default:
          this.$emit(type, ...args)
          break
      }
    },
    /**
     * @private
     */
    $_CGrid_setColumnDefine (colDef) {
      const index = this.$_CGrid_defineColumns.indexOf(colDef)
      if (index >= 0) {
        return
      }
      this.$_CGrid_defineColumns.push(colDef)
    },
    /**
     * @private
     */
    $_CGrid_removeColumnDefine (colDef) {
      const index = this.$_CGrid_defineColumns.indexOf(colDef)
      if (index < 0) {
        return
      }
      this.$_CGrid_defineColumns.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.c-grid {
  height: 100%;
  width: 100%;
}
.c-grid .define {
  display: none !important;
  position: fixed;
  top: -300px;
  left: -300px;
}
</style>
