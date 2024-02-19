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
    <template v-slot:append>
      <v-menu
        ref="timeMenu"
        v-model="timePickerVisible"
        :close-on-content-click="false"
        :max-width="maxPickerWidth"
      >
        <template #activator="{on}">
          <v-icon style="cursor: pointer" v-on="on"> mdi-clock-time-four-outline </v-icon>
        </template>
        <v-time-picker
          v-model="timePickerValue"
          format="24hr"
          scrollable
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
import {fieldValueFromTime} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';
import {
  timeToTimeString,
  nowDateTime,
  tryTimeStringToTime,
  ISO_TIME_FORMAT,
  HHMM_TIME_FORMAT,
} from '~/common/date-conversion';

export default defineComponent({
  name: 'time-input-control',

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
    const timePickerVisible: Ref<boolean> = ref(false);
    const timeFormatStr = computed(() => {
      return !props.field.extra?.timeFormatHHmm ? ISO_TIME_FORMAT : HHMM_TIME_FORMAT;
    });

    const rules = useRequiredRule(props.field.spec);
    rules.value.push((value: string | undefined): true | string => {
      return value
        ? tryTimeStringToTime(value, timeFormatStr.value)
          ? true
          : `Bремя в формате "${timeFormatStr.value === ISO_TIME_FORMAT ? 'чч:мм:сс' : 'чч:мм'}", например ${timeToTimeString(nowDateTime(), timeFormatStr.value)}`
        : true;
    });

    const timeValue = computed(() => {
      return props.field.hasValue ? props.field.asTime() : undefined;
    });

    const timePickerValue: Ref<string> = ref(timeToFormat(HHMM_TIME_FORMAT));

    const getStrValue = computed(() => {
      return props.field.hasValue ? timeToTimeString(props.field.asTime(), timeFormatStr.value) : undefined;
    });

    function timeToFormat(format: string): string {
      return props.field.hasValue && props.field.asTime().isValid() ? props.field.asTime().format(format) : '';
    }

    const timeFieldValue = computed(() => {
      return props.field ? props.field.value : undefined;
    });

    watch(timeFieldValue, () => {
      timePickerValue.value = timeToFormat(HHMM_TIME_FORMAT);
    });

    function onTextChange(value: string | undefined) {
      if (value) {
        const time = tryTimeStringToTime(value);
        if (time) {
          props.field.value = fieldValueFromTime(time);
        }
      } else {
        props.field.value = undefined;
      }
    }

    function changed(newValue: moment.Moment | undefined): void {
      if (!newValue) {
        props.field.value = undefined;
      } else if (!timeValue.value || (timeValue.value && !timeValue.value.isSame(newValue))) {
        props.field.value = fieldValueFromTime(newValue);
      }
    }

    function timePickerUpdated(value: string): void {
      timePickerVisible.value = false;
      changed(moment(value, HHMM_TIME_FORMAT, true));
    }

    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      getStrValue,
      onTextChange,
      timePickerVisible,
      timePickerUpdated,
      timePickerValue,
    };
  },
});
</script>

<style scoped />
