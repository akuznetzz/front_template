<template>
  <standard-edit-card-frame v-if="dataSource" :data-source="dataSource" @closeContext="$emit('closeContext', $event)">
    <v-tabs>
      <v-tab href="#main"> {{ verboseName }}:{{ getPrimaryKey() }}</v-tab>
      <v-tab-item value="main">
        <v-container>
          <v-row>
            <v-col v-for="field in allFieldsExceptTechFields" :key="field.spec.name" cols="3">
              <edit-frame :field="field" />
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>

      <v-tab v-if="techFields.length > 0" href="#tech"> Техническая информация</v-tab>
      <v-tab-item value="tech">
        <v-container>
          <v-row>
            <v-col v-for="field in techFields" :key="field.spec.name" cols="3">
              <edit-frame :field="field" />
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
    </v-tabs>
  </standard-edit-card-frame>
</template>

<script lang="ts">
import StandardEditCardFrame from './standard-edit-card-frame.vue';
import EditFrame from '~/framework/edit-frame/edit-frame.vue';
import {dataSourceHelper} from '~/framework/data-source-helper';
import {Presets} from '~/framework/presets';

const TECH_FIELDS = ['created', 'updated'];

export default defineComponent({
  name: 'StandardEditCard',
  components: {
    EditFrame,
    StandardEditCardFrame,
  },
  props: {
    apiModel: {
      type: String,
      required: true,
    },
    primaryKeyValue: {
      type: Number,
    },
    presets: {
      type: Array,
      required: false,
    },
  },
  setup(props) {
    const {
      dataSource,
      getPrimaryKey,
      verboseName,
      setTechFields,
      techFields,
      allFieldsExceptTechFields,
    } = dataSourceHelper(props.apiModel, props.primaryKeyValue, props.presets as Presets);

    watch(dataSource, () => {
      setTechFields(TECH_FIELDS);
    });

    return {
      dataSource,
      getPrimaryKey,
      verboseName,
      allFieldsExceptTechFields,
      techFields,
    };
  },
});
</script>

<style scoped></style>
