<template>
  <v-tab-item class="scroll-item" value="log">
    <actions-table :content-type-name="contentTypeName" :object-id="objectId" :custom-filter="customFilter" />
  </v-tab-item>
</template>

<script lang="ts">
import ActionsTable from '~/components/ActionsTable/ActionsTable.vue';

export default defineComponent({
  name: 'ActionsTableTab',
  components: {ActionsTable},
  props: {
    contentTypeName: {
      type: String,
      required: false,
    },
    objectId: {
      type: [String, Number],
      required: false,
    },
    customFilter: {
      type: Object,
      required: false,
    },
    value: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const root = getCurrentInstance().proxy;
    const actionsTable: any = ref(null);
    onMounted(() => {
      root.$parent.$children.forEach((component) => {
        if (component.$vnode.componentOptions!.tag === 'v-tabs') {
          const instance = getCurrentInstance()!.vnode.componentInstance;
          // instance.$children[0] - is v-tab-item
          // ...$slots.default[0] - is actions-table component node
          const node = instance!.$children[0].$slots.default![0];
          component.$on('change', function (value: any) {
            // assign actionsTable when it's already created
            if (node.componentInstance && !actionsTable.value) {
              actionsTable.value = node.componentInstance;
            }
            if (actionsTable.value && value === props.value) {
              actionsTable.value.refresh();
            }
          });
        }
      });
    });
  },
});
</script>
