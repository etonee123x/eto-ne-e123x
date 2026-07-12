import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
    {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      pluginJs.configs.recommended,
      pluginI18n.configs.recommended,
      tseslint.configs.strictTypeChecked,
      sonarjs.configs.recommended,
      eslintPluginUnicorn.configs.recommended,
      eslintPluginPrettierRecommended,
      importX.configs['flat/recommended'],
    ],

    plugins: {
      'import-x': importX,
    },

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueEslintParser,
      parserOptions: {
        projectService: true,
        parser: '@typescript-eslint/parser',
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.tsx'],
      },
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },

    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-unexpected-multiline': 'error',
      'no-var': 'error',
      'no-unsafe-optional-chaining': 'error',
      curly: ['error', 'all'],
      'arrow-body-style': ['error', 'always'],
      'no-sparse-arrays': ['off'],
      'prefer-const': ['error', { destructuring: 'all' }],
      'func-style': ['error', 'expression'],
      'no-return-assign': ['error', 'always'],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CatchClause > Identifier[typeAnnotation]:not([typeAnnotation.typeAnnotation.type="TSUnknownKeyword"])',
          message: 'catch-переменная должна быть только типа unknown',
        },
      ],
      'no-nested-ternary': 'error',
      'no-void': 'error',

      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
      ],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
          readonly: 'generic',
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^$',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',

      // https://github.com/typescript-eslint/typescript-eslint/issues/2865
      // TODO: пофиксить правила ниже vue типами
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',

      'sonarjs/todo-tag': 'warn',

      'unicorn/prevent-abbreviations': [
        'error',
        { allowList: { props: true, Props: true, ref: true, Ref: true, env: true, Env: true } },
      ],
      'unicorn/no-null': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/no-object-as-default-parameter': 'off',
      'unicorn/no-unreadable-array-destructuring': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/filename-case': 'off',

      'prettier/prettier': [
        'error',
        {
          printWidth: 120,
          singleQuote: true,
          endOfLine: 'auto',
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
