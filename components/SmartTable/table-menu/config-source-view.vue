<template>
  <div>
    <v-dialog v-model="showDialog" max-width="550">
      <v-card class="pa-4">
        <v-card-title>
          <span class="headline">{{ $t('smartTable.conf.configSource') }}</span>
        </v-card-title>
        {{ configSource }}
      </v-card>
    </v-dialog>
    <v-dialog v-model="applyDialog" max-width="550">
      <v-card class="pa-4">
        <v-card-title>
          <span class="headline">{{ $t('smartTable.conf.applySource') }}</span>
        </v-card-title>
        <v-text-field
          :rules="[(value) => !!value || $t('common.required')]"
          :label="$t('common.name')"
          :key="applyDialog"
          @change="onChangeNameValue"
        />
        <v-textarea
          :rules="[(value) => !!value || $t('common.required')]"
          :label="$t('smartTable.conf.configSource')"
          :key="applyDialog + 't'"
          @change="onChangeSourceValue"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn color="green darken-1" text @click="closeApplyDialog()">
            {{ $t('common.apply') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {warn} from '~/framework/messages';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';

export default defineComponent({
  name: 'ConfigSourceDialog',

  props: {
    onCloseDialog: {
      type: Function,
      default: () => {},
    },
  },

  setup(props) {
    const configSource = ref();
    const showDialog = ref(false);
    const applyDialog = ref(false);

    const viewName = ref();
    const viewSource = ref();

    function showSourceDialog(source) {
      configSource.value = source;
      showDialog.value = true;
    }

    function showApplyDialog() {
      viewName.value = '';
      viewSource.value = '';
      applyDialog.value = true;
    }

    function onChangeNameValue(value: string) {
      viewName.value = value;
    }

    function onChangeSourceValue(value: string) {
      viewSource.value = value;
    }

    function closeApplyDialog() {
      if (viewName.value && viewSource.value) {
        try {
          JSON.parse(viewSource.value);
        } catch {
          warn(window.$nuxt.$t('common.incorrectData'));
          return false;
        }
        props.onCloseDialog({
          modalResult: ModalResult.Accepted,
          payload: {viewName: viewName.value, viewSource: viewSource.value},
        });
        applyDialog.value = false;
      }
    }

    return {
      showDialog,
      applyDialog,
      configSource,
      showSourceDialog,
      showApplyDialog,
      viewName,
      viewSource,
      onChangeNameValue,
      onChangeSourceValue,
      closeApplyDialog,
    };
  },
});
</script>
