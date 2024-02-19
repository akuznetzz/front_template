<template>
  <v-dialog
    v-model="showDialog"
    max-width="95%"
    persistent
    scrollable
    @keydown.enter.prevent="onCloseDialog(getDialogDenied())"
    @keydown.esc.prevent="onCloseDialog(getDialogDenied())"
  >
    <v-card>
      <v-toolbar color="primary" dark> Выбор таблицы</v-toolbar>

      <v-card-text>
        <base-tables-list @closeContext="onCloseDialog($event)" />
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="green darken-1" text @click="onCloseDialog(getDialogDenied())"> Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import BaseTablesList from '~/components/AdminBaseTable/base-tables-list.vue';

export default defineComponent({
  name: 'ChoiceTableDialog',

  components: {
    BaseTablesList,
  },

  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    onCloseDialog: {
      type: Function,
      default: () => {},
    },
  },

  setup() {
    function getDialogDenied() {
      return {modalResult: ModalResult.Denied, payload: {tableName: 'dispatchers', context: ''}};
    }

    return {
      getDialogDenied,
    };
  },
});
</script>

<style scoped></style>
