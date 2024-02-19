import {setupObjectChoiceHandlers} from '~/framework/edit-frame/input-controls/object-choice/object-choice-config';
import {setupEditFrameHandlers} from '~/framework/edit-frame/edit-frame-config';
import {setupSearchComponentNameHandler} from '~/framework/execute-component/edit-card-config.ts';
import {registerEditCards, registerGlobalComponents} from '~/components/components-config';
import {setupCollectRelatedTableFiltersHandlers} from '~/components/SmartTable/input-assistant/collect-related-table-filters-config';

export default (_context: any, _inject: any) => {
  setupCollectRelatedTableFiltersHandlers();
  setupObjectChoiceHandlers();
  setupEditFrameHandlers();
  setupSearchComponentNameHandler();
  registerEditCards();
  registerGlobalComponents();
};
