<template>
  <v-text-field
    light
    :value="inputValue"
    :clearable="clearable"
    :disabled="disabled"
    :label="label"
    :color="color"
    :rules="rules"
    @change="textUpdated($event)"
    @click="openClosePicker"
  >
    <template v-if="!disabled" slot="append">
      <v-menu
        v-model="visible"
        :disabled="disabled"
        :close-on-content-click="false"
        :max-width="maxWidth"
        bottom
        offset-y
      >
        <template #activator="{on}">
          <v-icon style="cursor: pointer" v-on="on"> mdi-calendar </v-icon>
        </template>
        <v-date-picker
          :value="pickerValue"
          :first-day-of-week="1"
          locale="ru-ru"
          :color="color"
          @change="pickerUpdated($event)"
        />
      </v-menu>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import moment from 'moment';
import {ISO_DATE_FORMAT, LONG_DATE_FORMAT, SHORT_DATE_FORMAT} from '~/common/date-conversion';

export default defineComponent({
  name: 'DatePicker',
  props: {
    currentValue: {
      // Current date value
      default: null,
    },
    color: {
      // Datepicker color
      type: String,
      default: 'primary',
    },
    label: {
      // Input field label
      type: String,
      default: '',
    },
    clearable: {
      // Show clear input field button
      type: Boolean,
      default: true,
    },
    maxWidth: {
      default: 290,
    },
    setToday: {
      // if no currentValue set it TODAY
      default: true,
    },
    disabled: {
      default: false,
    },
    rules: {
      type: Array,
      default: () => [],
    },
  },

  setup(props: any, {emit}: {emit: any}) {
    function isoDateToMoment(value: string): moment.Moment {
      return moment(value, ISO_DATE_FORMAT);
    }

    function changed(newValue: moment.Moment): void {
      if (!data.value.isSame(newValue)) {
        emit('change', newValue.isValid() ? newValue.format(ISO_DATE_FORMAT) : null);
      }
    }

    function textUpdated(value: string): void {
      const date: moment.Moment = value ? moment(value, [LONG_DATE_FORMAT, SHORT_DATE_FORMAT], true) : moment(null);
      if (!date.isValid() && !date.parsingFlags().nullInput) {
        throw new Error('Неверный формат даты.');
      }
      changed(date);
    }

    function pickerUpdated(value: string): void {
      visible.value = false;
      changed(moment(value, ISO_DATE_FORMAT, true));
    }

    function dataToFormat(format: string): string {
      return data.value.isValid() ? data.value.format(format) : '';
    }

    const data: Ref<moment.Moment> = computed(() => isoDateToMoment(props.currentValue));
    const visible: Ref<boolean> = ref(props.visible);
    const inputValue: Ref<string> = computed((): string => dataToFormat(LONG_DATE_FORMAT));
    const pickerValue: Ref<string> = computed((): string => dataToFormat(ISO_DATE_FORMAT));

    if (!data.value && props.setToday) {
      changed(moment());
    }

    function openClosePicker() {
      visible.value = !visible.value;
    }

    return {
      visible,
      inputValue,
      pickerValue,
      textUpdated,
      pickerUpdated,
      openClosePicker,
    };
  },
});
</script>

<style scoped></style>
