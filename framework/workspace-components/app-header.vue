<template>
  <nav v-if="root.$auth.loggedIn">
    <v-navigation-drawer v-model="drawer" :enable-resize-watcher="drawer" app left>
      <v-list>
        <template v-for="[name, route] in routesMap.entries()">
          <v-list-group v-if="route.group" :key="name" no-action>
            <template #activator>
              <v-list-item-content>
                <v-list-item-title>
                  {{ route.title }}
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <template v-for="[childeName, childRoute] in routesMap.entries()">
              <v-list-item
                v-if="childRoute.parent === name"
                :key="childeName"
                :to="childRoute.path"
              >
                <v-list-item-title>
                  {{ childRoute.title }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-list-group>

          <v-list-item
            v-else-if="!route.group && !route.parent && name !== 'login'"
            :key="name"
            :to="route.path"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ route.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-right>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>{{ title || '' }}</v-toolbar-title>
      <workspace-navigation />
      <v-spacer />
      <template v-if="root.$config.public.companyName">
        <v-divider vertical inset />
        <v-tooltip left open-delay="2000">
          <template #activator="{on}">
            <div class="mx-4 company-name" v-on="on">
              <template>
                {{ root.$config.public.companyName }}
              </template>
            </div>
          </template>
          {{ root.$config.public.releaseVersion }}
        </v-tooltip>
        <v-divider vertical inset />
      </template>
      <p class="user ml-4">
        {{ root.$auth.user.person || $t('common.userWithoutName') }}
      </p>
      <v-btn color="primary" @click="root.$auth.logout()"> {{ $t('login.logout') }}</v-btn>
    </v-app-bar>
  </nav>
</template>

<script lang="ts">
import WorkspaceNavigation from '~/framework/workspace-components/workspace-navigation.vue';
import {isRouteName, ROUTES} from '~/common/routes';
import {assertIsDefined} from '~/common/assertions';

export default defineComponent({
  name: 'AppHeader',

  components: {
    WorkspaceNavigation,
  },

  setup() {
    const root = getCurrentInstance().proxy;

    const drawer = ref(false);
    const routesMap = ROUTES();

    const title = computed(() => {
      const routeName = root.$route.name;
      assertIsDefined(routeName);
      if (isRouteName(routeName)) {
        // in case of dynamic routes just skip the title set up
        return routesMap.has(routeName) ? routesMap.checkedGet(routeName).title : '';
      }
    });

    watch(
      () => root.$route,
      () => {
        drawer.value = false;
      },
    );

    return {
      root,
      drawer,
      routesMap,
      title,
    };
  },
});
</script>

<style lang="sass" scoped>
.user
  margin-bottom: 0
  margin-right: 15px

.v-application--is-ltr .v-list-group--no-action > .v-list-group__items > .v-list-item
  padding-left: 32px

.company-name
  font-size: 1.25rem
  font-weight: bold
  text-align: center
</style>
