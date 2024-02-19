<template>
  <v-text-field
    :label="label"
    :disabled="field.refReadOnly.value"
    :clearable="!field.refReadOnly.value"
    validate-on-blur
    :rules="rules"
    :value="getStrValue"
    @change="onTextChange"
  >
    <template v-if="!field.refReadOnly.value" v-slot:append>
      <v-menu v-model="datePickerVisible" :close-on-content-click="false" :max-width="maxPickerWidth">
        <template #activator="{on}">
          <v-icon style="cursor: pointer" v-on="on"> mdi-calendar </v-icon>
        </template>
        <v-date-picker
          :value="datePickerValue"
          :first-day-of-week="1"
          locale="ru-ru"
          :color="'primary'"
          @change="datePickerUpdated($event)"
        />
      </v-menu>
      <v-menu
        ref="timeMenu"
        v-model="timePickerVisible"
        :disabled="!dateTimeHasValue"
        :close-on-content-click="false"
        :max-width="maxPickerWidth"
      >
        <template #activator="{on}">
          <v-icon style="cursor: pointer" v-on="on"> mdi-clock-time-four-outline </v-icon>
        </template>
        <v-time-picker
          v-model="timePickerValue"
          format="24hr"
          @change="timePickerUpdated($event)"
          @click:minute="timePickerUpdated(timePickerValue)"
        />
      </v-menu>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import moment from 'moment';
import {Field} from '~/framework/data-source';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';
import {
  dateTimeToDateTimeString,
  tryDateTimeStringToDTime,
  nowDateTime,
  ISO_DATE_FORMAT,
} from '~/common/date-conversion';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {fieldValueFromDateTime} from '~/common/FieldValue';

const PICKER_TIME_FORMAT: string = 'HH:mm';

export default defineComponent({
  name: 'DateTimeInputControl',

  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
    maxPickerWidth: {
      default: 290,
    },
  },

  setup(props) {
    const datePickerVisible: Ref<boolean> = ref(false);
    const timePickerVisible: Ref<boolean> = ref(false);

    const rules = useRequiredRule(props.field.spec);
    rules.value.push((value: string | undefined): true | string => {
      return value
        ? tryDateTimeStringToDTime(value)
          ? true
          : `Дата время в формате "ДД.ММ.ГГГГ чч:мм:сс", например ${dateTimeToDateTimeString(nowDateTime())}`
        : true;
    });

    const dateTimeHasValue = computed(() => {
      return props.field.hasValue;
    });

    const dateTimeValue = computed(() => {
      return props.field.hasValue ? props.field.asDateTime() : undefined;
    });

    const getStrValue = computed(() => {
      return props.field.hasValue ? dateTimeToDateTimeString(props.field.asDateTime()) : undefined;
    });

    function dataTimeToFormat(format: string): string {
      return props.field.hasValue && props.field.asDateTime().isValid() ? props.field.asDateTime().format(format) : '';
    }

    const datePickerValue: Ref<string> = computed((): string => dataTimeToFormat(ISO_DATE_FORMAT));
    const timePickerValue: Ref<string> = ref(dataTimeToFormat(PICKER_TIME_FORMAT));

    const dateTimeFieldValue = computed(() => {
      return props.field ? props.field.value : undefined;
    });

    watch(dateTimeFieldValue, () => {
      timePickerValue.value = dataTimeToFormat(PICKER_TIME_FORMAT);
    });

    function onTextChange(value: string | undefined) {
      if (value) {
        const dateTime = tryDateTimeStringToDTime(value);
        if (dateTime) {
          props.field.value = fieldValueFromDateTime(dateTime);
        }
      } else {
        props.field.value = undefined;
      }
    }

    function changed(newValue: moment.Moment): void {
      if (!dateTimeValue.value || (dateTimeValue.value && !dateTimeValue.value.isSame(newValue))) {
        props.field.value = fieldValueFromDateTime(newValue);
      }
    }

    function datePickerUpdated(value: string): void {
      datePickerVisible.value = false;
      changed(moment(timePickerValue.value ? `${value}T${timePickerValue.value}` : value, moment.ISO_8601, true));
    }

    function timePickerUpdated(value: string): void {
      timePickerVisible.value = false;
      changed(moment(`${datePickerValue.value}T${value}`, moment.ISO_8601, true));
    }

    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      getStrValue,
      onTextChange,
      datePickerVisible,
      datePickerUpdated,
      datePickerValue,
      timePickerVisible,
      timePickerUpdated,
      timePickerValue,
      dateTimeHasValue,
    };
  },
});
</script>

<style scoped></style>
