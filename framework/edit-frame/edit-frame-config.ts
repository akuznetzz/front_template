import {installEventHandler} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';
import {createInputControlSpecAppEventId} from '~/framework/edit-frame/create-input-type-spec';
import {
  defaultCreateInputControlSpec,
  registerInputControls,
} from '~/framework/edit-frame/input-controls/default-input-control-spec';

export function setupEditFrameHandlers() {
  registerInputControls();
  installEventHandler(appEventList, createInputControlSpecAppEventId, defaultCreateInputControlSpec);
}
