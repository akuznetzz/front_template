<template>
  <v-select
    :items="values"
    item-text="display_name"
    item-value="value"
    :hint="field.refReadOnly.value ? '' : 'Выберите значение'"
    :return-object="false"
    :label="label"
    :value="field.value ? field.value.asString() : undefined"
    :readonly="field.refReadOnly.value"
    :error-messages="errorMessages()"
    :rules="rules"
    validate-on-blur
    @change="onChange"
  />
</template>

<script lang="ts">
import {fieldValueFromString} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';

export default defineComponent({
  name: 'SelectInputControl',
  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },
  setup(props) {
    const rules = useRequiredRule(props.field.spec);
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

    const values = computed(() => props.field?.spec?.choices || []);

    function onChange(value: string) {
      props.field.value = fieldValueFromString(value);
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
    };
  },
});
</script>

<style scoped></style>
