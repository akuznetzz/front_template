import {installEventHandler} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';
import {searchDBObjectsEventId} from '~/framework/edit-frame/input-controls/object-choice/search-dbobjects';
import {defaultSearchObjects} from '~/framework/edit-frame/input-controls/object-choice/default-search-dbobjects';
import {getDBObjectDescriptionEventId} from '~/framework/edit-frame/input-controls/object-choice/get-dbobject-description';
import {defaultGetDBObjectDescription} from '~/framework/edit-frame/input-controls/object-choice/default-get-dbobject-description';

export function setupObjectChoiceHandlers() {
  installEventHandler(appEventList, searchDBObjectsEventId, defaultSearchObjects);
  installEventHandler(appEventList, getDBObjectDescriptionEventId, defaultGetDBObjectDescription);
}
