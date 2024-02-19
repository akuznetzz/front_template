<template>
  <date-picker
    :label="label"
    :disabled="field.refReadOnly.value"
    :clearable="!field.refReadOnly.value"
    :rules="rules"
    :current-value="getValue"
    @change="onChange"
  />
</template>

<script lang="ts">
import {Field} from '~/framework/data-source';
import DatePicker from '~/components/DatePicker/DatePicker.vue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {fieldValueFromDate} from '~/common/FieldValue';
import {
  dateToDateString,
  dateToISOString,
  isoStringToDate,
  nowDateTime,
  tryDateStringToDate,
} from '~/common/date-conversion';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';

export default defineComponent({
  name: 'DateInputControl',
  components: {
    DatePicker,
  },
  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },

  setup(props) {
    const rules = useRequiredRule(props.field.spec);
    rules.value.push((value: string | undefined): true | string => {
      return value
        ? tryDateStringToDate(value)
          ? true
          : `Дата в формате "ДД.ММ.ГГГГ", например ${dateToDateString(nowDateTime())}`
        : true;
    });

    const getValue = computed(() => {
      // todo: it would be nice if datepicker could work directly with Moment
      return props.field.value ? dateToISOString(props.field.value.asDate()) : undefined;
    });

    function onChange(value: string | undefined) {
      props.field.value = value ? fieldValueFromDate(isoStringToDate(value)) : undefined;
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
