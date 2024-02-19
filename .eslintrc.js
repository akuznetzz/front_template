module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    './eslint.js.config.js',
    './eslint.ts.config.js',
    'plugin:prettier/recommended',
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    'object-curly-spacing': ['error', 'never'],
    'vue/no-mutating-props': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/no-unused-components': 'off',
    'vue/no-use-v-if-with-v-for': 'off',
    'vue/no-unused-vars': 'off',
    'vue/require-prop-type-constructor': 'off',
    'vue/return-in-computed-property': 'off',
    'vue/require-prop-types': 'off',
    'vue/html-indent': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-template-shadow': 'off',
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
};
