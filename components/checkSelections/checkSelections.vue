<template>
  <div class="pl-2">
    <v-tooltip top>
      <template #activator="{on}">
        <v-btn color="success" small @click="sendToCheck" :disabled="!rows.length" v-on="on">
          <v-icon left> mdi-check </v-icon>
          {{ title }}
        </v-btn>
      </template>
      {{ tooltip }}
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import {httpPost} from '~/framework/httpRequest';
import {info, warn, error} from '~/framework/messages';
import {CHOOSE_RECORD, CHECKED, RECORDS} from '~/common/constants';

const SET_CHECKED = 'set_checked/';

export default defineComponent({
  props: {
    controller: {
      type: String,
      required: true,
    },
    tooltip: {
      type: String,
      default: 'Отметить выбранные записи проверенными',
    },
    rows: {
      type: Array,
      required: true,
    },
    replyFunction: {
      type: <any>Function,
      required: true,
    },
    title: {
      type: String,
      default: 'Проверено',
    },
    state: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    async function sendToCheck() {
      if (props.rows.length) {
        try {
          const res = await httpPost(SET_CHECKED, {model: props.controller, id_list: props.rows, is_on: props.state});
          info(`${CHECKED} ${res.data.done_amount} ${RECORDS}`);
          props.replyFunction(props.rows);
        } catch (e) {
          error(e.message);
        }
      } else {
        warn(CHOOSE_RECORD);
      }
    }

    return {
      sendToCheck,
    };
  },
});
</script>
