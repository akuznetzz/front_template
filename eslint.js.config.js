module.exports = {
  rules: {},
  overrides: [
    {
      files: ['*.js'],
      rules: {
        quotes: ['error', 'single'],
        semi: [2, 'always'],
        'no-console': 'off',
        'no-trailing-spaces': 'off',
      },
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      parserOptions: {
        parser: 'babel-eslint',
        ecmaVersion: 2017,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: false,
        },
      },
    },
  ],
};
