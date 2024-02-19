<template>
  <div>
    <slot />
  </div>
</template>

<script lang="ts">
import {sendEvent} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';

export const MESSAGE_INTERNAL_SERVER_ERROR: string = 'Внутренняя ошибка сервера';
export const MESSAGE_UNCAUGHT_EXCEPTION: string =
  'Необработанное исключение при асинхронной обработке. Далее приводятся подробности.\n';
export const UNHANDLED_REJECTION = 'unhandledrejection';
let UNHANDLED_REJECTION_ERROR_IS_SET = false;

export const unhandledRejectionError = Symbol('unhandledRejectionError');

export default defineComponent({
  setup() {
    if (!UNHANDLED_REJECTION_ERROR_IS_SET) {
      window.addEventListener(UNHANDLED_REJECTION, async (event: any) => {
        await sendEvent(appEventList, unhandledRejectionError, event);
        UNHANDLED_REJECTION_ERROR_IS_SET = true;
      });
    }

    onErrorCaptured((err: any) => {
      sendEvent(appEventList, unhandledRejectionError, err);
      return false;
    });
  },
});
</script>

<style lang="sass" scoped>
// maybe it would be better not to use div here, because it violates flex-box hierarchy, but for now, this kind of fix will do
div
  display: flex
  flex: 1 1 auto
</style>
