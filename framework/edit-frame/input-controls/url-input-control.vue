<template>
  <v-text-field
    :label="label"
    :readonly="field.refReadOnly.value"
    :hint="field.refReadOnly.value ? '' : 'Введите значение'"
    :rules="rules"
    validate-on-blur
    :value="field.value ? field.value.asString() : undefined"
    :error-messages="errorMessages()"
    @change="onChange"
  >
    <template #prepend-inner>
      <v-icon :disabled="!hasValidURL" @click="onClickBrowseUrl"> mdi-cloud-search-outline </v-icon>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import {Field} from '~/framework/data-source';
import {capitalizeFirstChar} from '~/framework/utils/capitalize-first-char';
import {fieldValueFromString} from '~/common/FieldValue';
import {useRequiredRule} from '~/framework/edit-frame/input-controls/required-rule';

const DEFAULT_ERROR_MSG = 'Неверный формат URL!';

export default defineComponent({
  name: 'url-input-control',

  props: {
    field: {
      type: Object as PropType<Field>,
      required: true,
    },
  },

  setup(props) {
    const rules = useRequiredRule(props.field.spec);

    function isValidUrlStr(value: string | undefined): true | string {
      if (!value) {
        return true;
      }
      let url;
      try {
        url = new URL(value);
      } catch (_) {
        return DEFAULT_ERROR_MSG;
      }
      return url.protocol === "http:" || url.protocol === "https:" || DEFAULT_ERROR_MSG;
    }

    rules.value.push(isValidUrlStr);

    const hasValidURL = computed(() => {
      const urlStrdValue = props.field.value?.asString();
      return urlStrdValue && isValidUrlStr(urlStrdValue) === true;
    });

    function onChange(value: string) {
      props.field.value = fieldValueFromString(value);
    }

    function errorMessages() {
      return props.field?.extra?.errorMessages;
    }

    function onClickBrowseUrl() {
      window.open(props.field.value?.asString(), '_blank');
    }

    return {
      label: capitalizeFirstChar(props.field.spec ? props.field.spec.label : ''),
      rules,
      onChange,
      errorMessages,
      hasValidURL,
      onClickBrowseUrl,
    };
  },
});
</script>

<style scoped>

</style>
