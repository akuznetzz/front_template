<template>
  <div>
    <v-container fluid>
      <v-radio-group v-model="contextSelection" row>
        <v-radio v-for="(item, i) in CONTEXT_ITEMS" :key="i" :value="item.value" :label="item.title" />
      </v-radio-group>
      <hr>
    </v-container>
    <v-text-field
      v-model="searchNamePart"
      clear-icon="mdi-close-circle-outline"
      clearable
      hide-details
      label="Поиск таблицы"
    />
    <v-simple-table dense fixed-header height="500px">
      <template #default>
        <thead>
          <tr>
            <th class="text-left">Наименование</th>
            <th class="text-left">table name</th>
          </tr>
        </thead>
        <tbody v-if="tablesList">
          <tr v-for="item in tablesList" :key="item.name" @dblclick="onChoiceTable(item.name)">
            <td>{{ item.title }}</td>
            <td>{{ item.name }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script lang="ts">
import {filterTablesList, getTablesList} from '~/components/AdminBaseTable/base-tables-list-helper';
import {ModalResult} from '~/framework/workspace-manager/workspace-manager-spec';

const SEARCH_DELAY = 1000;
const CONTEXT_ITEMS = [
  {value: '', title: 'Общий кабинет'},
  {value: 'rightholder-cabinet-user', title: 'Кабинет правообладателя'},
];

export default defineComponent({
  name: 'BaseTablesList',

  setup(_props, {emit}) {
    const root = getCurrentInstance().proxy;
    const domainModel = (root as any).$domainModel;
    const tablesList: Ref = ref();
    let fullTableList: Array<any> | undefined;
    const searchNamePart = ref();
    let lastSearch: string | undefined = '';
    let timer: number;
    const contextSelection = ref('');

    onMounted(async () => {
      clearTimeout(timer);
      fullTableList = await getTablesList(domainModel);
      tablesList.value = fullTableList;
    });

    watch(searchNamePart, (searchStr: string | undefined) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (lastSearch === searchStr) {
          return;
        }
        lastSearch = searchStr;
        tablesList.value = filterTablesList(fullTableList, lastSearch);
      }, SEARCH_DELAY);
    });

    function onChoiceTable(tableName: string) {
      emit('closeContext', {modalResult: ModalResult.Accepted, payload: {tableName, context: contextSelection.value}});
    }

    return {
      onChoiceTable,
      searchNamePart,
      tablesList,
      CONTEXT_ITEMS,
      contextSelection,
    };
  },
});
</script>

<style scoped></style>
