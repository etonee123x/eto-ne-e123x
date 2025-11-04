import { defineConfig } from 'eslint/config';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginI18n from '@intlify/eslint-plugin-vue-i18n';
import importPlugin from 'eslint-plugin-import';
import vueEslintParser from 'vue-eslint-parser';
import sonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default defineConfig(
  {
    ignores: ['dist/', 'node_modules/', 'src/api/swagger/'],
  },
  {
    ignores: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    basePath: 'scripts',
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    extends: [
      importPlugin.flatConfigs.recommended,
      pluginJs.configs.recommended,
      pluginI18n.configs.recommended,
      tseslint.configs.strictTypeChecked,
      pluginVue.configs['flat/recommended'],
      sonarjs.configs.recommended,
      eslintPluginUnicorn.configs.recommended,
      eslintPluginPrettierRecommended,
    ],

    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        projectService: true,
        parser: '@typescript-eslint/parser',
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
    settings: {
      'vue-i18n': {
        localeDir: './src/i18n/messages/*.{json,json5,yaml,yml}',
        messageSyntaxVersion: '^11.0.0',
      },
      'import/resolver': {
        typescript: true,
      },
    },

    rules: {
      'import/no-empty-named-blocks': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'import/no-duplicates': 'error',

      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-unexpected-multiline': 'error',
      'no-var': 'error',
      'no-unsafe-optional-chaining': 'error',
      curly: ['error', 'all'],
      'arrow-body-style': ['error', 'as-needed'],
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

      'vue/prefer-separate-static-class': 'error',
      'vue/no-ref-as-operand': 'error',
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: true,
        },
      ],
      'vue/padding-line-between-blocks': ['error', 'always'],
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'GLOBAL',
            'OTHER_ATTR',
            'RENDER_MODIFIERS',
            ['UNIQUE', 'SLOT'],
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'EVENTS',
            'CONTENT',
          ],
          alphabetical: false,
        },
      ],
      'vue/no-empty-component-block': 'error',
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script'],
        },
      ],
      'vue/v-bind-style': [
        'error',
        'shorthand',
        {
          sameNameShorthand: 'always',
        },
      ],
      'vue/prop-name-casing': ['error', 'camelCase', { ignoreProps: ['/^(?:[a-z]+[A-Z]*)+:(?:[a-z]+[A-Z]*)+$/'] }],
      'vue/custom-event-name-casing': ['error', 'camelCase', { ignores: ['/^(?:[a-z]+[A-Z]*)+:(?:[a-z]+[A-Z]*)+$/'] }],
      'vue/attribute-hyphenation': ['error', 'never'],
      'vue/v-on-event-hyphenation': ['error', 'never'],
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/no-boolean-default': 'error',
      'vue/no-restricted-html-elements': ['error', 'pre'],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/define-emits-declaration': ['error', 'type-literal'],
      'vue/component-definition-name-casing': 'error',
      'vue/no-restricted-block': ['error', 'style'],
      'vue/no-template-shadow': 'off',
      'vue/no-dupe-keys': 'off',
      'vue/one-component-per-file': 'off',

      '@intlify/vue-i18n/no-deprecated-i18n-component': 'error',
      '@intlify/vue-i18n/no-deprecated-i18n-place-attr': 'error',
      '@intlify/vue-i18n/no-deprecated-i18n-places-prop': 'error',
      '@intlify/vue-i18n/no-deprecated-modulo-syntax': 'error',
      '@intlify/vue-i18n/no-deprecated-tc': 'error',
      '@intlify/vue-i18n/no-deprecated-v-t': 'error',
      '@intlify/vue-i18n/no-html-messages': 'error',
      '@intlify/vue-i18n/no-i18n-t-path-prop': 'error',
      '@intlify/vue-i18n/no-missing-keys': 'error',
      '@intlify/vue-i18n/no-raw-text': ['error', { ignoreText: ['—'] }],
      '@intlify/vue-i18n/no-v-html': 'error',
      '@intlify/vue-i18n/valid-message-syntax': 'error',
      '@intlify/vue-i18n/no-unused-keys': 'error',
      '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',

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
  {
    files: ['**/*.vue'],
    rules: {
      'unicorn/filename-case': ['error', { case: 'pascalCase' }],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'unicorn/filename-case': ['error', { case: 'camelCase' }],
    },
  },
);
