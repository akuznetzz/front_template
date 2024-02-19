<template>
  <v-dialog v-model="showDialog" persistent max-width="490">
    <v-card
      @keydown.enter.prevent="onCloseDialog(getDialogResult(true))"
      @keydown.esc.prevent="onCloseDialog(getDialogResult(false))"
    >
      <v-card-title>
        <span class="headline">Наименование и путь к полю</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                ref="firstFocus"
                label="Наименование"
                :value="editTitleValue"
                :rules="[(value) => !!value || 'Обязательно.']"
                @change="onChangeTitleValue"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Путь к полю"
                :value="editNameValue"
                :rules="[(value) => !!value || 'Обязательно.']"
                @change="onChangeNameValue"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="green darken-1" text @click="onCloseDialog(getDialogResult(false))"> Закрыть </v-btn>
        <v-btn color="green darken-1" text @click="onCloseDialog(getDialogResult(true))"> Применить </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';

export default defineComponent({
  name: 'ManualFieldDialog',

  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    onCloseDialog: {
      type: Function,
      default: () => {},
    },
    inTitleValue: {
      type: String,
      required: false,
    },
    inNameValue: {
      type: String,
      required: false,
    },
  },

  setup(props) {
    const root = getCurrentInstance().proxy;
    const firstFocus = ref();
    let changeValue = false;
    const editTitleValue = ref<string>();
    const editNameValue = ref<string>();

    watch(
      () => props.showDialog,
      (showDialog) => {
        changeValue = false;
        editTitleValue.value = showDialog ? props.inTitleValue : undefined;
        editNameValue.value = showDialog ? props.inNameValue : undefined;
        if (showDialog) {
          root.$nextTick(() => {
            if (firstFocus.value) {
              firstFocus.value.focus();
            }
          });
        }
      },
    );

    function onChangeTitleValue(value: string) {
      changeValue = true;
      editTitleValue.value = value;
    }

    function onChangeNameValue(value: string) {
      changeValue = true;
      editNameValue.value = value;
    }

    function getDialogResult(accept: boolean) {
      return {
        modalResult:
          accept && changeValue && editTitleValue.value && editNameValue.value
            ? ModalResult.Accepted
            : ModalResult.Denied,
        payload: {nameValue: editNameValue.value, titleValue: editTitleValue.value},
      };
    }

    return {
      firstFocus,
      editTitleValue,
      editNameValue,
      onChangeTitleValue,
      onChangeNameValue,
      getDialogResult,
    };
  },
});
</script>

<style scoped />
