<template>
  <v-text-field
    v-if="!multiline"
    :label="label"
    :readonly="readonly"
    :hint="readonly ? '' : 'Введите значение'"
    :rules="rules"
    validate-on-blur
    :value="field.value ? field.value.asString() : undefined"
    :error-messages="errorMessages()"
    @change="onChange"
  />
  <v-textarea
    v-else
    :label="label"
    :readonly="readonly"
    :hint="readonly ? '' : 'Введите значение'"
    :rules="rules"
    validate-on-blur
    rows="1"
    auto-grow
    :value="field.value ? field.value.asString() : undefined"
    :error-messages="errorMessages()"
    @change="onChange"
  />
</template>

<script lang="ts">
import {fieldValueFromString} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {Field} from '~/framework/data-source';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';

export default defineComponent({
  name: 'StringInputControl',
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

    function onChange(value: string) {
      props.field.value = fieldValueFromString(value);
    }

    const multiline = computed(() => props.field?.extra?.multiline);

    const readonly = computed(() => props.field.refReadOnly.value || props.extra?.readonly);

    function errorMessages() {
      return props.field?.extra?.errorMessages;
    }

    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      onChange,
      multiline,
      errorMessages,
      readonly,
    };
  },
});
</script>

<style scoped></style>
