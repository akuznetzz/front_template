import colors from 'vuetify/es5/util/colors';
import {defineNuxtConfig} from '@nuxt/bridge';

const LOCALES = [
  {
    code: 'en',
    iso: 'en',
    name: 'English',
    file: 'en-US.json',
  },
  {
    code: 'ru',
    iso: 'ru',
    name: 'Русский',
    file: 'ru-RU.json',
  },
];

// console.info(`aggregator id: ${process.env.AGGREGATOR_ID}, company name: "${process.env.COMPANY_NAME}"`);

// eslint-disable-next-line import/no-mutable-exports
let config = {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  vite: true,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: `%s${process.env.API_URL ? '' : ' - test'}`,
    title: 'RHUX',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: 'Alles frontend'},
    ],
    link: [{rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [{src: '~/assets/awesome-notifications.scss', lang: 'scss'}, {src: '~/assets/main.css'}],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    {src: '~/plugins/awesome-notifications', ssr: false},
    {src: '~/plugins/domain-model', ssr: false},
    {src: '~/plugins/workspace-manager', ssr: false},
    {src: '~/plugins/vue-clipboard2', ssr: false},
    {src: '~/plugins/casl', ssr: false},
    {src: '~/plugins/app-config', ssr: false},
    {src: '~/plugins/components', ssr: false},
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    // https://go.nuxtjs.dev/stylelint
    // '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    'cookie-universal-nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    strategy: 'no_prefix',
    locales: LOCALES,
    lazy: true,
    langDir: 'assets/locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
    },
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {baseURL: process.env.API_URL || 'http://localhost:8000/api/'},

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  router: {
    middleware: ['auth'],

    extendRoutes(routes, resolve) {
      routes.push({
        name: 'cardInNewWindowRout',
        path: '/:tableName/:primaryKey',
        component: resolve(__dirname, 'components/EntitiesEditCards/TablesCard.vue'),
        props: true,
      });
    },
  },

  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
      home: '/',
    },
    strategies: {
      local: {
        scheme: '~/common/refresh-scheme-with-permissions.ts',
        token: {
          property: 'access',
        },
        refreshToken: {
          property: 'refresh',
          data: 'refresh',
        },
        user: {
          property: false, // use whole response as user
        },
        endpoints: {
          login: {
            url: '/auth/token/obtain/',
            method: 'post',
          },
          refresh: {
            url: '/auth/token/refresh/',
            method: 'post',
          },
          logout: {
            url: '/auth/logout/',
            method: 'post',
          },
          user: {
            url: '/auth/me/',
            method: 'get',
          },
        },
        clientId: {
          aggregator_id: process.env.AGGREGATOR_ID,
        },
      },
    },
    plugins: ['~/plugins/axios-auth'],
  },
};

try {
  const apply = require('./customConfig.js').default;
  config = apply(config);
  console.info('Custom configuration is present and has been applied.');
} catch (e) {
  console.info('No custom config present - using defaults.');
}

export default defineNuxtConfig(config);
