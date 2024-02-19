import {DataSource} from '~/framework/data-source';

export const saveCardFrameDataEventId = Symbol('saveCardFrameDataEventId');
export const validateEditCardFrameEventId = Symbol('validateEditCardFrameEventId');

export interface SaveCardFrameDataParameters {}

export interface ValidateEditCardFrameParameters {
  EditForm: any; // in
  EditDataSource: DataSource | DataSource[]; // in
  ValidEditCardFrame: boolean | undefined; // out
}
