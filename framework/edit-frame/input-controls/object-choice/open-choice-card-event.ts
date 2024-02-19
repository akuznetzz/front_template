export const openChoiceObjectCardEventId = Symbol('openChoiceObjectCardEventId');

export interface OpenChoiceObjectCardParameters {
  tableName: string; // in
  objectID: any; // in
  cardResult: any | undefined; // out
  props?: any;
}
