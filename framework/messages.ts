import {IWorkspaceManager} from '~/framework/workspace-manager/workspace-manager-spec.ts';

const MESSAGE_THREE_DOTS: string = '...';
function MESSAGE_ATTENTION() {
  return window.$nuxt.$t('common.attention');
}
function MESSAGE_INFORMATION() {
  return window.$nuxt.$t('common.forInfo');
}

const DEFAULT_TOP_PADDING: string = '104px';
const MODIFIED_TOP_PADDING: string = '120px';
const EDIT_CARD_NAME: string = 'standard-edit-card';

export interface Options {
  maxLen?: number;
  title?: string;
  duration?: number;
  context?: string;
}

const markedContextSet = new Set();

const DEFAULT_MAX_LEN = 300;
const DEFAULT_DURATION = 5000;

function setAwnToastPadding() {
  const awn = document.getElementById('awn-toast-container');
  const workspaceManager: any = (window.$nuxt as any).$workspaceManager as IWorkspaceManager;
  const currentWorkspace = [...workspaceManager.contexts.value].pop();
  if (!awn) {
    return;
  }
  if (currentWorkspace?.active && currentWorkspace?.dynamicComponent?.name === EDIT_CARD_NAME) {
    awn.style.top = MODIFIED_TOP_PADDING;
  } else {
    awn.style.top = DEFAULT_TOP_PADDING;
  }
}

export function error(message: string, options?: Options): void {
  if (options?.context) {
    if (markedContextSet.has(options.context)) {
      return;
    }
    markedContextSet.add(options.context);
  }
  // @ts-ignore
  window.$nuxt.$awn.alert(messageMaxLen(message, options?.maxLen || DEFAULT_MAX_LEN), {
    labels: {alert: options?.title || MESSAGE_ATTENTION()},
    durations: {alert: options?.duration || DEFAULT_DURATION},
  });
  setAwnToastPadding();
}

export function info(message: string, options?: Options): void {
  // @ts-ignore
  window.$nuxt.$awn.info(messageMaxLen(message, options?.maxLen || DEFAULT_MAX_LEN), {
    labels: {info: options?.title || MESSAGE_INFORMATION()},
    durations: {info: options?.duration || DEFAULT_DURATION},
  });
  setAwnToastPadding();
}

export function warn(message: string, options?: Options): void {
  // @ts-ignore
  window.$nuxt.$awn.warning(messageMaxLen(message, options?.maxLen || DEFAULT_MAX_LEN), {
    labels: {warning: options?.title || MESSAGE_ATTENTION()},
    durations: {warning: options?.duration || DEFAULT_DURATION},
  });
  setAwnToastPadding();
}

export function success(message: string, options?: Options): void {
  // @ts-ignore
  window.$nuxt.$awn.success(messageMaxLen(message, options?.maxLen || DEFAULT_MAX_LEN), {
    labels: {success: options?.title || MESSAGE_INFORMATION()},
    durations: {success: options?.duration || DEFAULT_DURATION},
  });
  setAwnToastPadding();
}

export function confirm(message: string, value: any, maxLen: number = 300): void {
  // @ts-ignore
  window.$nuxt.$awn.confirm(messageMaxLen(message, maxLen), value);
}

function messageMaxLen(message: string, maxLen: number): string {
  if (message.length > maxLen) {
    return message.slice(0, maxLen) + MESSAGE_THREE_DOTS;
  } else {
    return message;
  }
}
