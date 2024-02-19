import {InputControlSpec} from './input-type-spec';
import {sendEvent} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';
import {assertIsDefined} from '~/common/assertions';

export const createInputControlSpecAppEventId = Symbol('createInputControlSpecAppEventId');

export interface CreateInputControlSpecParameters {
  type: string; // in
  inputControlSpec: InputControlSpec | undefined; // out
}

export async function createInputControlSpec(type: string): Promise<InputControlSpec> {
  const parameters: CreateInputControlSpecParameters = {type, inputControlSpec: undefined};
  await sendEvent(appEventList, createInputControlSpecAppEventId, parameters);
  assertIsDefined(parameters.inputControlSpec, `Can not create input control spec for type=${type}`);
  return parameters.inputControlSpec;
}
