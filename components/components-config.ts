import {registerVueComponent} from '~/framework/utils/register-component';
import SmartTable from '~/components/SmartTable/SmartTable.vue';
import MultiChoice from '~/components/MultiChoice/MultiChoice.vue';
import PhotoMultiChoice from '~/components/PhotoSelection/photo-multi-choice.vue';
import StandardEditCard from '~/framework/edit-card/standard-edit-card.vue';
import ActionsTableTabItem from '~/components/ActionsTable/actions-table-tab-item.vue';
import UploadFileCard from '~/components/upload-file-card/index.vue';
import ChoiceFilterPickerCard from '~/components/SmartTable/input-assistant/choice-filter-picker-card.vue';
import PersonsEditCard from '~/components/EntitiesEditCards/PersonsEditCard/persons-edit-card.vue';

export const SMART_TABLE_REG_NAME = 'smart-table';
export const EDIT_CARD_REG_NAME = 'standard-edit-card';

export function registerEditCards() {
  registerVueComponent(SmartTable, SMART_TABLE_REG_NAME);
  registerVueComponent(StandardEditCard, EDIT_CARD_REG_NAME);
  registerVueComponent(PersonsEditCard);
  registerVueComponent(MultiChoice);
  registerVueComponent(PhotoMultiChoice);
  registerVueComponent(UploadFileCard);
  registerVueComponent(ChoiceFilterPickerCard);
}

export function registerGlobalComponents() {
  registerVueComponent(ActionsTableTabItem);
}
