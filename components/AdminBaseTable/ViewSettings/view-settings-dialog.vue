<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="100%"
    @keydown.enter.prevent="onCloseDialog(formDialogResult(true))"
    @keydown.esc.prevent="onCloseDialog(formDialogResult(false))"
  >
    <v-card>
      <v-toolbar dark color="primary">{{ $t('smartTable.conf.customizeView') }}</v-toolbar>
      <v-card-text>
        <v-row style="height: 742px">
          <v-col cols="5" style="height: 100%">
            <v-row style="height: 517px">
              <v-col cols="12" style="height: 100%">
                {{ $t('smartTable.conf.renderedViewFields') }}
                <v-card class="scrollable-items-holder">
                  <shown-fields-list
                    :nodes-list="shownNodesList"
                    @shownChanged="onShownChanged"
                    @shownPermutation="onShownPermutation"
                  />
                </v-card>
              </v-col>
            </v-row>
            <v-row style="height: 200px">
              <v-col cols="12" class="pb-0" style="height: 100%">
                <b>{{ $t('smartTable.conf.sortFields') }}</b>
                <v-card class="scrollable-items-holder">
                  <sorted-fields-list
                    :nodes-list="sortedNodesList"
                    @sortedChanged="onSortedChanged"
                    @sortedPermutation="onSortedPermutation"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="7" class="pb-0" style="height: 100%">
            <b>{{ $t('smartTable.conf.availableFields') }}</b>
            <v-card class="scrollable-items-holder">
              <available-fields-tree
                v-if="treeNodesList"
                :tree-nodes-list="treeNodesList"
                :ctrl-nodes-list="ctrlNodesList"
                @shownChanged="onShownChanged"
                @sortedChanged="onSortedChanged"
                @filteredChanged="onFilteredChanged"
              />
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="green darken-1" text @click="onCloseDialog(formDialogResult(false))">{{
          $t('common.close')
        }}</v-btn>
        <v-btn
          color="green darken-1"
          text
          @keydown.enter="onCloseDialog(formDialogResult(true))"
          @click="onCloseDialog(formDialogResult(true))"
        >
          {{ $t('common.apply') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import ShownFieldsList from '~/components/AdminBaseTable/ViewSettings/shown-fields-list.vue';
import AvailableFieldsTree from '~/components/AdminBaseTable/ViewSettings/available-fields-tree.vue';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';
import SortedFieldsList from '~/components/AdminBaseTable/ViewSettings/sorted-fields-list.vue';
import FilteredFieldsList from '~/components/AdminBaseTable/ViewSettings/filtered-fields-list.vue';
import {
  SmartViewSettingsHelper,
  ViewFieldNode,
  ViewFieldNodesList,
  ViewSettingsHelper,
} from '~/components/AdminBaseTable/ViewSettings/view-settings-helper';

export default defineComponent({
  name: 'ViewSettingsDialog',

  components: {
    FilteredFieldsList,
    SortedFieldsList,
    ShownFieldsList,
    AvailableFieldsTree,
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
    tableName: {
      type: String,
      required: true,
    },
    smartTable: {
      type: Object as any,
    },
    context: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const root = getCurrentInstance().proxy;
    const domainModel = (root as any).$domainModel;
    const viewSettingsHelper = props.smartTable
      ? new SmartViewSettingsHelper(domainModel, props.tableName, props.smartTable, root)
      : new ViewSettingsHelper(domainModel, props.tableName, props.context, root);
    const {treeNodesList, shownNodesList, sortedNodesList, filteredNodesList, ctrlNodesList} =
      viewSettingsHelper.prepareHelper();

    watch(
      () => props.showDialog,
      async (showDialog) => {
        if (showDialog) {
          await viewSettingsHelper.tuneViewSettingsHelper();
        } else {
          viewSettingsHelper.resetViewSettingsHelper();
        }
      },
    );

    function formDialogResult(accept: boolean) {
      return {
        modalResult: accept ? ModalResult.Accepted : ModalResult.Denied,
        payload: {tableViewSettings: viewSettingsHelper.makeTableViewSettings()},
      };
    }

    function onShownChanged(item: ViewFieldNode) {
      viewSettingsHelper.shownChanged(item);
    }

    function onShownPermutation(nodesList: ViewFieldNodesList) {
      viewSettingsHelper.shownPermutation(nodesList);
    }

    function onSortedChanged(item: ViewFieldNode) {
      viewSettingsHelper.sortedChanged(item);
    }

    function onSortedPermutation(nodesList: ViewFieldNodesList) {
      viewSettingsHelper.sortedPermutation(nodesList);
    }

    function onFilteredChanged(item: ViewFieldNode) {
      viewSettingsHelper.filteredChanged(item);
    }

    return {
      onFilteredChanged,
      onSortedPermutation,
      onSortedChanged,
      sortedNodesList,
      onShownPermutation,
      onShownChanged,
      shownNodesList,
      treeNodesList,
      filteredNodesList,
      ctrlNodesList,
      formDialogResult,
    };
  },
});
</script>

<style scoped>
.scrollable-items-holder {
  width: 100%;
  height: 95%;
  overflow: hidden;
}
</style>
