<template>
  <standard-edit-card-frame v-if="dataSource" :data-source="dataSource" @closeContext="$emit('closeContext', $event)">
    <v-tabs v-model="cardTabs">
      <v-tab href="#main"> {{ verboseName }}:{{ getPrimaryKey() }} </v-tab>
    </v-tabs>

    <v-tabs-items v-model="cardTabs" class="scrollable-items-holder">
      <v-tab-item value="main" class="scrolling-item">
        <v-row v-for="(rowdef, i) in mainCardDef" :key="i" class="ma-0">
          <template v-for="(blockdef, j) in rowdef">
            <v-col :key="i * 100 + j" :cols="rowdef.length === 1 ? 12 : j === 0 ? 7 : 5" class="px-0 pt-0 pb-1">
              <v-card class="pa-4">
                <v-row>
                  <template v-for="flddescr in blockdef">
                    <v-col
                      :key="flddescr.fldname"
                      :cols="flddescr.cols ? flddescr.cols : 3"
                    >
                      <edit-frame :field="fieldByName(flddescr.fldname)" />
                    </v-col>
                  </template>
                </v-row>
              </v-card>
            </v-col>
          </template>
        </v-row>
      </v-tab-item>
    </v-tabs-items>
  </standard-edit-card-frame>
</template>

<script lang="ts">
import {mainCardDef} from './fields';
import StandardEditCardFrame from '~/framework/edit-card/standard-edit-card-frame.vue';
import EditFrame from '~/framework/edit-frame/edit-frame.vue';
import {dataSourceHelper, makeFieldsReadonly} from '~/framework/data-source-helper';
import {Presets} from '~/framework/presets';
import {DataSource} from '~/framework/data-source';
import {fieldValueFromArray} from '~/common/FieldValue';
import RelatedModel from '~/components/related-model/related-model.vue';
import {UPDATE} from '~/common/ability';

export default defineComponent({
  name: 'PersonsEditCard',
  components: {
    EditFrame,
    StandardEditCardFrame,
    RelatedModel,
  },
  props: {
    apiModel: {
      type: String,
      required: true,
    },
    primaryKeyValue: {
      type: [String, Number],
    },
    presets: {
      type: Array,
      required: false,
    },
    fromNegotiation: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const {dataSource, fieldByName, getPrimaryKey, verboseName} = dataSourceHelper(
      props.apiModel,
      props.primaryKeyValue,
    );

    const cardTabs: any = ref();

    watch(dataSource, (ds: DataSource | undefined) => {
      if (!ds) {
        return;
      }
    });


    return {
      cardTabs,
      dataSource,
      verboseName,
      fieldByName,
      getPrimaryKey,
      mainCardDef,
      UPDATE,
    };
  },
});
</script>

<style scoped>
.scrolling-item {
  width: 100%;
  height: 100%;
  padding: 10px 5px 3px 5px;
  overflow: auto;
}

.scrollable-items-holder {
  width: 100%;
  height: calc(100vh - 180px);
  overflow: hidden;
}
</style>
