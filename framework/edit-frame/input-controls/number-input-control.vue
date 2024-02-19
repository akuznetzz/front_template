<template>
  <v-text-field
    :label="label"
    :readonly="field.refReadOnly.value"
    :disabled="field.refReadOnly.value"
    :hint="field.refReadOnly ? '' : 'Введите значение'"
    type="number"
    :rules="rules"
    validate-on-blur
    :value="getValue"
    @change="onChange"
  />
</template>

<script lang="ts">
import {fieldValueFromNumber} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';

export default defineComponent({
  name: 'NumberInputControl',
  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },
  setup(props) {
    const rules = props.field.spec ? useRequiredRule(props.field.spec) : [];

    const getValue = computed(() => {
      if (props.field.value === undefined) {
        return undefined;
      }
      return props.field.value.asNumber().toFixed(props.field.spec!.decimal_places);
    });

    function onChange(value: string) {
      props.field.value = fieldValueFromNumber(Number(value));
    }

    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      getValue,
      onChange,
    };
  },
});
</script>

<style scoped></style>
