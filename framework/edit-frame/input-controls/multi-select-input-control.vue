<template>
  <div>
    {{ label }}:
    <v-checkbox
      v-for="(at, index) in fields"
      :key="index"
      v-model="values"
      multiple
      dense
      :value="at.value"
      :label="at.display_name"
      :rules="rules"
      validate-on-blur
      :readonly="field.refReadOnly.value"
      @change="onChange"
    />
  </div>
</template>

<script lang="ts">
import {fieldValueFromArray} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';

export default defineComponent({
  name: 'MultiSelectInputControl',
  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },
  setup(props) {
    const rules = useRequiredRule(props.field.spec);
    const values = ref();

    let testRegExp: RegExp;
    if (props.field?.extra?.testRegExpInfo?.testRegExp) {
      testRegExp = new RegExp(props.field?.extra?.testRegExpInfo?.testRegExp);
      rules.value.push((value: string | undefined): true | string => {
        return value
          ? testRegExp.test(value)
            ? true
            : props.field?.extra?.testRegExpInfo?.errorRegExp || 'Ошибка регулярного выражения!'
          : true;
      });
    }

    const fields = computed(() => props.field?.spec?.choices || []);

    onMounted(() => {
      values.value = props.field.value ? props.field.value.asArray() : [];
    });

    function onChange(value: string[] | number[]) {
      props.field.value = fieldValueFromArray(value);
    }

    function errorMessages() {
      return props.field?.extra?.errorMessages;
    }

    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      onChange,
      errorMessages,
      values,
      fields,
    };
  },
});
</script>

<style scoped></style>
