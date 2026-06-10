import { globalIgnores } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// ============================================================================
// Жёсткий ESLint 10 (flat config) для фронтенда.
// База: vue/recommended + typescript-eslint strictTypeChecked + stylisticTypeChecked
// (типобезопасный анализ), поверх — максимально строгие правила проекта.
// Форматирование отдано Prettier (skipFormatting в конце).
// ============================================================================
export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,
  vueTsConfigs.stylisticTypeChecked,

  // Включаем типобезопасный анализ (projectService) для .ts и .vue.
  {
    name: 'app/type-aware',
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    name: 'app/strict-rules',
    rules: {
      // --- Общая строгость ----------------------------------------------------
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      curly: ['error', 'all'],
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-object-spread': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-implicit-coercion': 'error',
      'no-useless-rename': 'error',
      'no-return-assign': ['error', 'always'],
      yoda: 'error',
      radix: 'error',
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-params': ['error', 5],
      'max-nested-callbacks': ['error', 4],
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],

      // --- TypeScript ---------------------------------------------------------
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowNullableObject: true, allowNullableBoolean: true, allowString: false, allowNumber: false },
      ],
      '@typescript-eslint/promise-function-async': 'error',
      // Жёсткий код-стайл: соглашения об именах.
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
        // Свойства объектов/типов не ограничиваем (snake_case БД, ключи библиотек).
        { selector: ['objectLiteralProperty', 'typeProperty'], format: null },
      ],
      // Числа в шаблонных строках безопасны — разрешаем (остальное строго).
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Без noUncheckedIndexedAccess правило ложно срабатывает на защитных
      // проверках доступа по индексу (массивы/Record) и вынуждает убирать нужную
      // рантайм-защиту. Безопасность типов закрывают strict-boolean-expressions и др.
      '@typescript-eslint/no-unnecessary-condition': 'off',

      // --- Vue — только Composition API, строгая разметка ----------------------
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/define-macros-order': [
        'error',
        { order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'] },
      ],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/no-unused-refs': 'error',
      'vue/no-v-html': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/require-typed-ref': 'error',
      'vue/require-typed-object-prop': 'error',
      'vue/no-required-prop-with-default': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-useless-mustaches': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
    },
  },

  // Тесты и конфиги — послабления.
  {
    name: 'app/test-overrides',
    files: ['**/*.{test,spec}.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'max-nested-callbacks': 'off',
    },
  },

  {
    name: 'app/entry-overrides',
    files: ['src/app/App.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  skipFormatting,
)
