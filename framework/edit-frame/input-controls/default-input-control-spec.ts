import Vue from 'vue';
import NumberInputControl from './number-input-control.vue';
import StringInputControl from './string-input-control.vue';
import UrlInputControl from './url-input-control.vue';
import ObjectChoiceControl from './object-choice/object-choice-control.vue';
import ManyChoiceControl from './many-choice/many-choice-control.vue';
import DateInputControl from './date-input-control.vue';
import DateTimeInputControl from './date-time-input-control.vue';
import TimeInputControl from './time-input-control.vue';
import BooleanInputControl from './boolean-input-control.vue';
import FileInputControl from './file-input-control.vue';
import ImageInputControl from './image-input-control.vue';
import SelectInputControl from './select-input-control.vue';
import MultiSelectInputControl from './multi-select-input-control.vue';
import {assert} from '~/common/assertions';
import {CreateInputControlSpecParameters} from '~/framework/edit-frame/create-input-type-spec';
import {EDEvent} from '~/framework/core/enhanced-delegation';

export function registerInputControls() {
  Vue.component(NumberInputControl.name, NumberInputControl);
  Vue.component(ObjectChoiceControl.name, ObjectChoiceControl);
  Vue.component(StringInputControl.name, StringInputControl);
  Vue.component(UrlInputControl.name, UrlInputControl);
  Vue.component(DateInputControl.name, DateInputControl);
  Vue.component(DateTimeInputControl.name, DateTimeInputControl);
  Vue.component(TimeInputControl.name, TimeInputControl);
  Vue.component(BooleanInputControl.name, BooleanInputControl);
  Vue.component(FileInputControl.name, FileInputControl);
  Vue.component(ImageInputControl.name, ImageInputControl);
  Vue.component(ManyChoiceControl.name, ManyChoiceControl);
  Vue.component(SelectInputControl.name, SelectInputControl);
  Vue.component(MultiSelectInputControl.name, MultiSelectInputControl);
}

export function defaultCreateInputControlSpec(event: EDEvent) {
  const parameters = event.parameters as CreateInputControlSpecParameters;
  let name: string;
  switch (parameters.type) {
    case 'integer':
    case 'decimal':
    case 'float':
      name = NumberInputControl.name;
      break;
    case 'one':
      name = ObjectChoiceControl.name;
      break;
    case 'email':
    case 'string':
    case 'field':
      name = StringInputControl.name;
      break;
    case 'url':
      name = UrlInputControl.name;
      break;
    case 'choice':
      name = SelectInputControl.name;
      break;
    case 'multiple choice':
      name = MultiSelectInputControl.name;
      break;
    case 'image upload':
      name = ImageInputControl.name;
      break;
    case 'date':
      name = DateInputControl.name;
      break;
    case 'datetime':
    case 'datetime without tz':
      name = DateTimeInputControl.name;
      break;
    case 'time':
      name = TimeInputControl.name;
      break;
    case 'boolean':
      name = BooleanInputControl.name;
      break;
    case 'file direct upload':
    case 'file upload':
      name = FileInputControl.name;
      break;
    case 'many':
      name = ManyChoiceControl.name;
      break;
    default:
      assert(false, `Default input control spec is not defined for type=${parameters.type}`);
  }
  parameters.inputControlSpec = {name};
}
