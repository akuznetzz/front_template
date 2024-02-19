<template>
  <v-checkbox
    :label="label"
    :readonly="field.refReadOnly.value"
    :hint="field.refReadOnly.value ? '' : 'Введите значение'"
    :rules="rules"
    validate-on-blur
    :indeterminate="field.value === undefined"
    :input-value="field.value ? field.value.asBoolean() : undefined"
    @change="onChange"
  />
</template>

<script lang="ts">
import {fieldValueFromBoolean} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';

export default defineComponent({
  name: 'BooleanInputControl',
  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },
  setup(props) {
    const rules = useRequiredRule(props.field.spec);
    function onChange(value: boolean) {
      props.field.value = fieldValueFromBoolean(value);
    }
    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      onChange,
    };
  },
});
</script>

<style scoped></style>
