import {FieldValue} from '~/common/FieldValue';
import {sendEvent} from '~/framework/core/enhanced-delegation';

export enum PresetType {
  Default,
  Fixed,
}

export interface Preset {
  field: string;
  type?: PresetType;
  value: FieldValue;
}

export type Presets = Array<Preset>;

export const collectPresetsEventId = Symbol('collectPresetsEventId');

export interface CollectPresetsParameters {
  presets: Presets; // out
}

export async function collectPresets(context: Object): Promise<Presets> {
  const parameters: CollectPresetsParameters = {presets: []};
  await sendEvent(context, collectPresetsEventId, parameters);
  if (context && (context as any).presets) {
    parameters.presets.push(...(context as any).presets);
  }
  return parameters.presets;
}
