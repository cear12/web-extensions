const js = require('@eslint/js');
const globals = require('globals');
const noUnsanitized = require('eslint-plugin-no-unsanitized');

module.exports = [
  { ignores: ['**/*.min.js', 'node_modules/**', 'dist/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, ...globals.serviceworker, chrome: 'readonly', QRCode: 'readonly', WebPrivacyCleanup: 'readonly', QRPayload: 'readonly', module: 'readonly' }
    },
    plugins: { 'no-unsanitized': noUnsanitized },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    // Page-authored templates that interpolate only escaped values, or fixed
    // strings; everything else must use textContent / DOM APIs.
    files: ['**/*.js'],
    rules: { 'no-unsanitized/property': 'warn', 'no-unsanitized/method': 'error' }
  },
  {
    files: ['eslint.config.js', 'tests/**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } }
  }
];
