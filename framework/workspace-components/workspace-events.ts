import {IWorkspaceContext} from '~/framework/workspace-manager/workspace-manager-spec';

export const workSpaceCloseEditCardId = Symbol('workSpaceCloseEditCardId');

export interface WorkSpaceCloseEditCardParameters {
  nextLoop: boolean;
  context: IWorkspaceContext;
}
