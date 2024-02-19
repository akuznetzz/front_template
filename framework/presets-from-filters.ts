import {FiltersMap} from '~/components/SmartTable/filters-spec';
import {Condition} from '~/common/filters';
import {Preset, Presets, PresetType} from '~/framework/presets';

export function collectPresetsFromFiltersMap(filtersMap: FiltersMap): Presets {
  const result = new Array<Preset>();
  for (const [, filters] of filtersMap) {
    for (const filter of filters) {
      if (filter.kind === 'simple' && filter.condition === Condition.Equals && !filter.field.includes('.')) {
        result.push({field: filter.field, type: PresetType.Fixed, value: filter.value});
      }
    }
  }
  return result;
}
