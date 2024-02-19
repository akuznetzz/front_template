<template>
  <div style="width: 100%; height: 100%" class="pa-2">
    <v-card style="width: 100%; height: 100%; padding-top: 0; padding-bottom: 0; padding-left: 8px; padding-right: 8px">
      <v-card-actions style="padding-bottom: 0">
        <slot name="servicePanelBefore" />
        <v-spacer />
        <slot name="servicePanel" />
        <v-btn
          v-if="buttons.reset"
          icon
          color="primary"
          title="Сбросить изменения"
          :disabled="!changed"
          @click="resetChanges()"
        >
          <v-icon>mdi-restart</v-icon>
        </v-btn>
        <v-btn v-if="buttons.save" icon color="primary" title="Сохранить" :disabled="!changed" @click="save()">
          <v-icon>mdi-content-save-outline</v-icon>
        </v-btn>
        <v-btn
          v-if="buttons.saveAndClose"
          icon
          color="secondary"
          title="Сохранить и закрыть"
          :disabled="!changed"
          @click="saveAndClose()"
        >
          <v-icon>mdi-content-save-move-outline</v-icon>
        </v-btn>
        <v-btn v-if="buttons.close" icon :title="$t('common.close')" @click="closeEditCard">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>

      <v-form ref="form" lazy-validation>
        <slot />
      </v-form>
    </v-card>
  </div>
</template>

<script lang="ts">
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import {DataSource} from '~/framework/data-source';
import {getEntityPrimaryKey} from '~/common/settings';
import {
  saveCardFrameDataEventId,
  SaveCardFrameDataParameters,
  validateEditCardFrameEventId,
  ValidateEditCardFrameParameters,
} from '~/framework/edit-card/standard-edit-card-frame.ts';
import {
  workSpaceCloseEditCardId,
  WorkSpaceCloseEditCardParameters,
} from '~/framework/workspace-components/workspace-events';
import {EDEvent, sendEvent, installEventHandler, removeEventHandler} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';
import {confirm, success} from '~/framework/messages';
import {workspaceManagerInjectionKey} from '~/framework/workspace-manager/workspace-manager';
import {CREATE, UPDATE} from '~/common/ability';

export default defineComponent({
  name: 'StandardEditCardFrame',
  props: {
    dataSource: {
      type: [Object, Array] as PropType<DataSource>,
      required: true,
    },
    controlButtons: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, {emit}) {
    const root = getCurrentInstance().proxy;
    const instance = markRaw({});
    const form = ref();
    const workspaceManager = (root as any).$workspaceManager;
    const uuid = [...workspaceManager.contexts.value].pop()?.uuid;

    onMounted(() => {
      installEventHandler(appEventList, workSpaceCloseEditCardId, closeEditCardFromNav);
    });

    onUnmounted(() => {
      removeEventHandler(appEventList, workSpaceCloseEditCardId, closeEditCardFromNav);
    });

    function closeEditCardFromNav(event: EDEvent) {
      if (uuid === (event.parameters as WorkSpaceCloseEditCardParameters).context.uuid && buttons.value.close) {
        closeEditCard(event);
      }
    }

    function resetChanges() {
      dataSource.value.forEach((ds) => {
        if (ds.changed) {
          ds.reset();
        }
      });
      form.value!.resetValidation();
      success('Изменения отменены');
    }

    function close(accept = false) {
      emit('closeContext', {
        modalResult: accept ? ModalResult.Accepted : ModalResult.Denied,
        payload: {primaryKey: primaryKeyValue.value},
      });
    }

    function closeEditCard(event: EDEvent) {
      if (changed.value && event.parameters) {
        (event.parameters as WorkSpaceCloseEditCardParameters).nextLoop = false;
      } else if (event) {
        event.done = true;
      }
      if (changed.value) {
        confirm('Имеются несохраненные изменения, они будут потеряны, действительно закрыть?', close);
      } else {
        close(false);
      }
    }

    async function defaultSaveCardFrameData() {
      for (const ds of dataSource.value) {
        if (ds.changed) {
          await ds.save();
        }
      }
    }

    async function saveData() {
      const parameters: SaveCardFrameDataParameters = {};
      await sendEvent(instance, saveCardFrameDataEventId, parameters, defaultSaveCardFrameData);
    }

    function defaultValidateEditCardFrame(event: EDEvent) {
      const params = event.parameters as ValidateEditCardFrameParameters;
      params.ValidEditCardFrame =
        params.ValidEditCardFrame &&
        params.EditForm.validate() &&
        (Array.isArray(params.EditDataSource)
          ? params.EditDataSource.every((ds) => ds.validate())
          : params.EditDataSource.validate());
    }

    async function validateEditCardFrame() {
      const params: ValidateEditCardFrameParameters = {
        EditForm: form.value,
        EditDataSource: dataSource.value,
        ValidEditCardFrame: true,
      };
      await sendEvent(instance, validateEditCardFrameEventId, params, defaultValidateEditCardFrame);
      return params.ValidEditCardFrame;
    }

    async function save() {
      if (await validateEditCardFrame()) {
        await saveData();
      }
    }

    async function saveAndClose() {
      if (await validateEditCardFrame()) {
        await saveData();
        close(true);
      }
    }

    const changed = computed(() => {
      return props.dataSource ? dataSource.value.some((ds) => ds.changed) : false;
    });

    const dataSource = computed(() => {
      return Array.isArray(props.dataSource) ? props.dataSource : [props.dataSource];
    });

    const primaryKeyValue = computed(() => {
      const primaryKeyField = dataSource.value[0].fieldByName(getEntityPrimaryKey(dataSource.value[0].entityName));
      return primaryKeyField.value ? primaryKeyField.value.asNumber() : null;
    });

    const canSaveEditCard = computed(() => {
      let canSave = false;
      dataSource.value.forEach((ds) => {
        const tableName = ds.modelSpec.name;
        const pkFieldHasValue = ds.fieldByName(getEntityPrimaryKey(ds.entityName)).hasValue;
        if ((!pkFieldHasValue && !root.$can(CREATE, tableName)) || (pkFieldHasValue && !root.$can(UPDATE, tableName))) {
          ds.readOnly = true;
        }
        if (!ds.readOnly) {
          canSave = true;
        }
      });
      return canSave;
    });

    const buttons = computed(() => {
      return canSaveEditCard.value
        ? {reset: true, save: true, saveAndClose: true, close: true, ...props.controlButtons}
        : {
            reset: false,
            save: false,
            saveAndClose: false,
            close: props.controlButtons?.close === undefined ? true : props.controlButtons.close,
          };
    });

    return {
      instance,
      form,
      resetChanges,
      closeEditCard,
      saveData,
      save,
      validateEditCardFrame,
      saveAndClose,
      changed,
      close,
      buttons,
    };
  },
});
</script>

<style scoped></style>
