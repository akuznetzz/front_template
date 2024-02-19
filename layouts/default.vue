<template>
  <v-app>
    <error-boundary>
      <app-header />
      <v-main>
        <nuxt />
      </v-main>
    </error-boundary>
  </v-app>
</template>

<script lang="ts">
import AppHeader from '~/framework/workspace-components/app-header.vue';
import {HTTP_ERROR, VALIDATION_ERROR} from '~/framework/httpRequest';
import {error} from '~/framework/messages';
import {installEventHandler} from '~/framework/core/enhanced-delegation';
import {appEventList} from '~/framework/core/app-event-list';
import errorBoundary, {
  unhandledRejectionError,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_UNCAUGHT_EXCEPTION,
  UNHANDLED_REJECTION,
} from '~/framework/errorBoundary.vue';
import {AbortActionName} from '~/common/abort-action';

export default defineComponent({
  components: {
    AppHeader,
    errorBoundary,
  },
  setup() {
    installEventHandler(appEventList, unhandledRejectionError, captureError);

    async function captureError(event: any) {
      await event.passEvent();
      const err: any = event.parameters;
      if (err?.name === AbortActionName) {
        // информацию о прерывании процесса не визуализируем
      } else if (err?.type === UNHANDLED_REJECTION) {
        if (err.reason?.name !== AbortActionName) {
          // информацию о прерывании процесса не визуализируем
          error(`${MESSAGE_UNCAUGHT_EXCEPTION}${err.reason?.message}.`);
        }
      } else if (err?.name === HTTP_ERROR) {
        error(`${MESSAGE_INTERNAL_SERVER_ERROR}: ${err.toString()}.`);
      } else if (err?.name === VALIDATION_ERROR) {
        error(err);
      } else {
        error(err.toString());
        console.log(err);
      }
    }
  },
});
</script>

<style lang="sass">
html
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
  font-size: 16px
  word-spacing: 1px
  -ms-text-size-adjust: 100%
  -webkit-text-size-adjust: 100%
  -moz-osx-font-smoothing: grayscale
  -webkit-font-smoothing: antialiased
  box-sizing: border-box
  overflow-y: auto !important

h1
  padding: 10px

*, *:before, *:after
  box-sizing: border-box
  margin: 0
  font-weight: 300
</style>
