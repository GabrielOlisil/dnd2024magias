// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    eqeqeq: ['error', 'smart'],
    curly: ['error', 'all'],
    'no-unused-vars': 'error',
    'no-unreachable': 'error',
    'vue/no-mutating-props': 'error',
    'vue/no-unused-components': 'error'
  }
});