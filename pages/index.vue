<template>
  <div></div>
</template>

<script lang="ts">
import {MESSAGE_USER_PERSON_NOT_SET} from '~/common/constants';
import {IWorkspaceManager} from '~/framework/workspace-manager/workspace-manager-spec';

export default defineComponent({
  setup() {
    const root = getCurrentInstance().proxy;

    const user = root.$auth?.user;
    const globalStore = root.$store as any;
    const workspaceManager = (window.$nuxt as any).$workspaceManager as IWorkspaceManager;

    if (!user) {
      return;
    }

    // remove all context on enter
    workspaceManager.clearContext();
    if (globalStore.state.auth?.loggedIn) {
      if (!user.person_id) {
        throw MESSAGE_USER_PERSON_NOT_SET;
      }
    }
  },
});
</script>
