<template>
  <!--  The div tag is very important in this place to get the correct link to the edit-frame html element. -->
  <div>
    <v-tooltip v-model="tooltip.show" :disabled="!tooltip.show" :open-delay="500" top>
      <template #activator="{on}">
        <div ref="inputControl" v-on="on" @mousemove="mouseMove">
          <component :is="inputControlSpec.name" v-if="inputControlSpec" :field="field" :extra="extra" />
        </div>
      </template>
      {{ tooltip.text }}
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import {Field} from '~/framework/data-source';
import {createInputControlSpec} from '~/framework/edit-frame/create-input-type-spec';
import {FieldSpec} from '~/framework/dbd/dbd-spec';
import {InputControlSpec} from '~/framework/edit-frame/input-type-spec';

const TAG_INPUT = 'INPUT';

export default defineComponent({
  name: 'EditFrame',
  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
    extra: {
      type: Object,
      default: () => {},
    },
  },
  setup(props) {
    const inputControlSpec = ref<InputControlSpec>();
    const inputControl = ref();
    const currentMousePosition = ref();

    onMounted(async () => {
      if (props.field.spec) {
        inputControlSpec.value = await createInputControlSpec(props.field.spec.type);
      }
    });

    watch(props.field.refSpec, async (spec: FieldSpec | undefined) => {
      inputControlSpec.value = spec ? await createInputControlSpec(spec.type) : undefined;
    });

    const tooltip = computed(() => {
      let text;
      let show;
      const control = inputControl?.value?.getElementsByTagName(
        currentMousePosition.value === TAG_INPUT ? 'input' : 'label',
      )[0];
      if (control) {
        text = currentMousePosition.value === TAG_INPUT ? control.value : control.innerHTML;
        show = control.scrollWidth > control.clientWidth;
      }
      return {text, show};
    });

    function mouseMove(event: any) {
      currentMousePosition.value = event.target.nodeName;
    }

    return {
      inputControlSpec,
      tooltip,
      inputControl,
      mouseMove,
    };
  },
});
</script>
