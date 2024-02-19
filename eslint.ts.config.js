module.exports = {
  overrides: [
    {
      extends: ['@nuxtjs/eslint-config-typescript', 'plugin:vue/essential'],
      plugins: ['vue'],
      parserOptions: {
        ecmaFeatures: {
          jsx: false,
        },
      },
      rules: {
        'comma-dangle': 'off',
        'dot-notation': 'off',
        'no-array-constructor': 'off',
        'no-console': 'off',
        'no-trailing-spaces': 'off',
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
        'padded-blocks': 'off',
        'space-before-function-paren': 'off',
        camelcase: 'off',
        eqeqeq: 'off',
        indent: 'off',
        semi: [2, 'always'],
      },
      files: ['*.ts', '*.vue'],
    },
  ],
};
