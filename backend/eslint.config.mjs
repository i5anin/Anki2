import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

// ============================================================================
// Жёсткий ESLint 10 (flat config) для бэкенда NestJS.
// База: eslint:recommended + typescript-eslint strictTypeChecked +
// stylisticTypeChecked (типобезопасный анализ). Форматирование — Prettier.
// ============================================================================
export default tseslint.config(
  {
    name: 'app/ignores',
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs', 'coverage/**'],
  },

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    name: 'app/lang',
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    name: 'app/core-extra',
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-constant-binary-expression': 'error',
    },
  },

  {
    name: 'app/strict',
    rules: {
      // --- Общая строгость ----------------------------------------------------
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
      'no-param-reassign': ['error', { props: false }],
      'no-useless-rename': 'error',
      yoda: 'error',
      radix: 'error',
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-params': ['error', 5],

      // --- TypeScript ---------------------------------------------------------
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Жёсткий код-стайл: соглашения об именах.
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
        // Свойства не ограничиваем: snake_case строк БД и payload'ов Supabase.
        { selector: ['objectLiteralProperty', 'typeProperty'], format: null },
      ],

      // NestJS: модули/провайдеры — классы-обёртки с декораторами.
      '@typescript-eslint/no-extraneous-class': 'off',
      // Методы async, реализующие Promise-интерфейс DataStore, могут не иметь await.
      '@typescript-eslint/require-await': 'off',
      // Без noUncheckedIndexedAccess правило ложно срабатывает на защитных проверках.
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },

  // Граница с supabase-js: клиент типизирован свободно (Database = any),
  // нестрогие операции на этой границе неизбежны — точечно ослабляем ТОЛЬКО здесь.
  {
    name: 'app/supabase-boundary',
    files: ['src/store/supabase.service.ts', 'src/store/supabase.store.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },

  // Тесты — послабления.
  {
    name: 'app/tests',
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'max-params': 'off',
    },
  },

  prettier,
)
