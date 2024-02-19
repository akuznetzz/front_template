import {componentNameToKebabCase} from '~/framework/utils/register-component';


import PersonsEditCard from '~/components/EntitiesEditCards/PersonsEditCard/persons-edit-card.vue';
import {EDIT_CARD_REG_NAME} from '~/components/components-config';


export function getEditCardName(apiModel: string) {
  const editCards = new Map([
    ['persons', componentNameToKebabCase(PersonsEditCard)],
  ]);
  return editCards.get(apiModel) || EDIT_CARD_REG_NAME;
}
