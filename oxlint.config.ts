import type { OxlintConfig } from 'oxlint';
import combined from './oxlint/oxlintCombined.config.ts';

const config: OxlintConfig = {
  extends: [combined],
  plugins: [
    'import',
    'eslint',
    'unicorn',
    'node',
    'vitest',
    'jsx-a11y',
    'jsdoc',
    'promise',
    'typescript',
    'oxc',
  ],
  jsPlugins: [
    'eslint-plugin-unused-imports',
    'eslint-plugin-command',
    'eslint-plugin-jsonc',
    'eslint-plugin-yml',
  ],
  categories: {
    correctness: 'error',
    suspicious: 'error',
    pedantic: 'warn',
    perf: 'warn',
    style: 'error',
    restriction: 'error',
    nursery: 'warn',
  },
  env: {
    builtin: true,
    es2026: true,
    browser: true,
    node: true,
  },
  globals: {
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    vi: 'readonly',
    beforeAll: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    afterAll: 'readonly',
  },
  rules: {
    // These are irrelevant to modern typescript codebases
    'no-async-await': 'off',
    'no-undefined': 'off',
    'no-ternary': 'off',
    'no-plusplus': 'off',
    'no-negated-condition': 'off',
    'no-optional-chaining': 'off',
    'no-rest-spread-properties': 'off',
    'no-map-spread': 'off',
    'require-await': 'off',
    'import/no-unassigned-import': 'off',
    'jsdoc/require-param': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-returns-type': 'off',
    'unicorn/no-negated-condition': 'off',

    // Rules with opinions the codebase disagrees with
    // These have specific reasons for being disabled
    complexity: 'off', // Consider changing if team size increases and arbitrary limits are needed.
    'id-length': 'off', // Good idea but too strict to be practical.
    'max-dependencies': 'off', // Consider changing if team size increases and arbitrary limits are needed.
    'max-statements': 'off', // Consider changing if team size increases and arbitrary limits are needed.
    'max-lines': 'off', // Consider changing if team size increases and arbitrary limits are needed.
    'max-lines-per-function': 'off', // Consider changing if team size increases and arbitrary limits are needed.
    'no-duplicate-imports': 'off', // Superseded by import/no-duplicates
    'no-loop-func': 'off', // The use of "var" is prohibited, so this rule is mostly extraneous.
    'no-magic-numbers': 'off', // Ad-hoc numbers are allowed, particularly in tests.
    'no-useless-assignment': 'off', // Often used for type assertion checks
    'no-underscore-dangle': 'off', // Internally allowed for unused variables
    'sort-imports': 'off', // Superseded by import/sort
    'typescript/no-inferrable-types': 'off', // Excessive clarity is preferable to ambiguity
    'import/no-nodejs-modules': 'off', // Codebase is designed only for NPM-compatible environments
    'unicorn/no-array-reduce': 'off', // Reduce is often ideal for this idiom.
    'vitest/require-hook': 'off', // Vitest hooks are not required for tests
    'vitest/no-hooks': 'off', // Vitest hooks can be used for setup and teardown where sensible
    'vitest/prefer-called-once': 'off', // Called times for consistency

    // These are styling preferences
    'no-inline-comments': 'off', // Inline comments allowed for short clarifications
    'no-warning-comments': 'off', // Warning comments allowed for future reference
    'no-named-export': 'off', // Named exports are preferred for readability
    'no-immediate-mutation': 'off', // Immutable updates are preferred for readability
    'prefer-destructuring': 'off', // Destructuring is not always the best option for readability
    'prefer-ternary': 'off', // Ternary is not always the best option for readability
    'sort-keys': 'off', // Keys are ordered by definition order, not alphabetically.
    'import/no-relative-parent-imports': 'off', // Stricter rules are delegated to the boundary plugin
    'import/prefer-default-export': 'off', // Named exports are preferred for readability
    'vitest/prefer-importing-vitest-globals': 'off', // No reason to require explicit vitest global imports.

    // Temporarily disabled rules for sanity.
    // TODO: These are a concession to the existing code, not an opinion.
    // They should be re-enabled one by one in the future.
    // Priority: CRITICAL
    'import/no-cycle': 'off',
    'no-array-for-each': 'off',
    // Priority: HIGH
    'init-declarations': 'off',
    'max-params': 'off',
    'max-depth': 'off',
    'no-await-in-loop': 'off',
    'no-null': 'off',
    'no-shadow': 'off',
    'vitest/valid-title': 'off',
    'vitest/prefer-strict-boolean-matchers': 'off',
    // Priority: MEDIUM
    'consistent-function-scoping': 'off',
    'func-style': 'off',
    'no-continue': 'off',
    'import/exports-last': 'off',
    'import/group-exports': 'off',
    'typescript/explicit-function-return-type': 'off',
    'unicorn/prefer-native-coercion-functions': 'off',
    // Priority: LOW
    'vitest/require-mock-type-parameters': 'off',
    'vitest/require-test-timeout': 'off',
    'vitest/no-conditional-expect': 'off',
    'vitest/no-conditional-in-test': 'off',
    'vitest/prefer-expect-assertions': 'off',
    'vitest/max-expects': 'off',

    // Rules that require some configuration
    // For this project, naming conventions are not enforced.
    'unicorn/filename-case': 'off',
    'accessor-pairs': [
      'error',
      {
        enforceForClassMembers: true,
        setWithoutGet: true,
      },
    ],
    eqeqeq: ['error', 'smart'],
    'new-cap': [
      'error',
      {
        capIsNew: false,
        newIsCap: true,
        properties: true,
      },
    ],
    'no-cond-assign': ['error', 'always'],
    'no-console': [
      'error',
      {
        allow: ['error'],
      },
    ],
    'no-labels': [
      'error',
      {
        allowLoop: false,
        allowSwitch: false,
      },
    ],
    'no-unneeded-ternary': [
      'error',
      {
        defaultAssignment: false,
      },
    ],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTaggedTemplates: true,
        allowTernary: true,
      },
    ],
    'no-unused-vars': [
      'error',
      {
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
    'unicode-bom': ['error', 'never'],
    'unused-imports/no-unused-vars': [
      'error',
      {
        // Set to 'none': interface/type method signatures name their params for
        // Oxlint's js-plugin bridge counts those named params as unused.
        args: 'none',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
    'valid-typeof': [
      'error',
      {
        requireStringLiterals: true,
      },
    ],
    yoda: ['error', 'never'],
    'command/command': 'error',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/no-duplicates': [
      'error',
      {
        'prefer-inline': false,
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.?([cm])[jt]s?(x)'],
      rules: {
        'node/handle-callback-err': ['error', '^(err|error)$'],
        'node/no-exports-assign': 'error',
        'node/no-new-require': 'error',
        'node/no-path-concat': 'error',
        'jsdoc/check-access': 'warn',
        'jsdoc/check-property-names': 'warn',
        'jsdoc/empty-tags': 'warn',
        'jsdoc/implements-on-classes': 'warn',
        'jsdoc/no-defaults': 'warn',
        'jsdoc/require-param-name': 'warn',
        'jsdoc/require-property': 'warn',
        'jsdoc/require-property-description': 'warn',
        'jsdoc/require-property-name': 'warn',
        'jsdoc/require-returns-description': 'warn',
      },
      plugins: ['node', 'jsdoc'],
    },
    {
      files: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
      rules: {
        'constructor-super': 'off',
        'no-class-assign': 'off',
        'no-const-assign': 'off',
        'no-dupe-keys': 'off',
        'no-func-assign': 'off',
        'no-import-assign': 'off',
        'no-new-native-nonconstructor': 'off',
        'no-obj-calls': 'off',
        'no-redeclare': [
          'error',
          {
            builtinGlobals: false,
          },
        ],
        'no-setter-return': 'off',
        'no-this-before-super': 'off',
        'no-unsafe-negation': 'off',
        'no-with': 'off',
        'prefer-const': [
          'error',
          {
            destructuring: 'all',
            ignoreReadBeforeAssign: true,
          },
        ],
        'no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTaggedTemplates: true,
            allowTernary: true,
          },
        ],
        'no-unused-vars': 'off',
        'no-useless-constructor': 'off',
        'no-use-before-define': [
          'error',
          {
            classes: false,
            functions: false,
            variables: true,
          },
        ],
        'typescript/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
          },
        ],
        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-dynamic-delete': 'off',
        'typescript/no-empty-object-type': [
          'error',
          {
            allowInterfaces: 'always',
          },
        ],
        'typescript/consistent-type-definitions': ['error', 'interface'],
        'typescript/consistent-type-imports': [
          'error',
          {
            disallowTypeAnnotations: false,
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],
      },
      plugins: ['typescript'],
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'import/unambiguous': 'off',
      },
      plugins: ['typescript'],
    },
    {
      files: ['**/*.test.ts'],
      rules: {
        // Temporarily allowed while tests are being rewritten
        // Should be turned back on one by one.
        // Where bad type assertions are required for runtime checking tests,
        // Exceptions should be made inline, not globally.
        'typescript/no-explicit-any': 'off',
        'typescript/no-non-null-assertion': 'off',
        'typescript/no-unsafe-type-assertion': 'off',

        'vitest/consistent-test-it': [
          'error',
          {
            fn: 'it',
            withinDescribe: 'it',
          },
        ],
      },
      plugins: ['vitest', 'typescript'],
    },
    {
      files: ['**/*.json', '**/*.json5', '**/*.jsonc'],
      rules: {
        'jsonc/no-bigint-literals': 'error',
        'jsonc/no-binary-expression': 'error',
        'jsonc/no-binary-numeric-literals': 'error',
        'jsonc/no-dupe-keys': 'error',
        'jsonc/no-escape-sequence-in-identifier': 'error',
        'jsonc/no-floating-decimal': 'error',
        'jsonc/no-hexadecimal-numeric-literals': 'error',
        'jsonc/no-infinity': 'error',
        'jsonc/no-multi-str': 'error',
        'jsonc/no-nan': 'error',
        'jsonc/no-number-props': 'error',
        'jsonc/no-numeric-separators': 'error',
        'jsonc/no-octal': 'error',
        'jsonc/no-octal-escape': 'error',
        'jsonc/no-octal-numeric-literals': 'error',
        'jsonc/no-parenthesized': 'error',
        'jsonc/no-plus-sign': 'error',
        'jsonc/no-regexp-literals': 'error',
        'jsonc/no-sparse-arrays': 'error',
        'jsonc/no-template-literals': 'error',
        'jsonc/no-undefined-value': 'error',
        'jsonc/no-unicode-codepoint-escapes': 'error',
        'jsonc/no-useless-escape': 'error',
        'jsonc/space-unary-ops': 'error',
        'jsonc/valid-json-number': 'error',
      },
      jsPlugins: ['eslint-plugin-jsonc'],
    },
    {
      files: ['**/package.json'],
      rules: {
        'jsonc/sort-array-values': [
          'error',
          {
            order: {
              type: 'asc',
            },
            pathPattern: '^files$',
          },
        ],
        'jsonc/sort-keys': [
          'error',
          {
            order: [
              'publisher',
              'name',
              'displayName',
              'type',
              'version',
              'private',
              'packageManager',
              'description',
              'author',
              'contributors',
              'license',
              'funding',
              'homepage',
              'repository',
              'bugs',
              'keywords',
              'categories',
              'sideEffects',
              'imports',
              'exports',
              'main',
              'module',
              'unpkg',
              'jsdelivr',
              'types',
              'typesVersions',
              'bin',
              'icon',
              'files',
              'engines',
              'activationEvents',
              'contributes',
              'scripts',
              'peerDependencies',
              'peerDependenciesMeta',
              'dependencies',
              'optionalDependencies',
              'devDependencies',
              'pnpm',
              'overrides',
              'resolutions',
              'husky',
              'simple-git-hooks',
              'lint-staged',
              'eslintConfig',
            ],
            pathPattern: '^$',
          },
          {
            order: {
              type: 'asc',
            },
            pathPattern:
              '^(?:dev|peer|optional|bundled)?[Dd]ependencies(Meta)?$',
          },
          {
            order: {
              type: 'asc',
            },
            pathPattern: '^(?:resolutions|overrides|pnpm.overrides)$',
          },
          {
            order: {
              type: 'asc',
            },
            pathPattern: '^workspaces\\.catalog$',
          },
          {
            order: {
              type: 'asc',
            },
            pathPattern: '^workspaces\\.catalogs\\.[^.]+$',
          },
          {
            order: ['types', 'import', 'require', 'default'],
            pathPattern: '^exports.*$',
          },
          {
            order: [
              'pre-commit',
              'prepare-commit-msg',
              'commit-msg',
              'post-commit',
              'pre-rebase',
              'post-rewrite',
              'post-checkout',
              'post-merge',
              'pre-push',
              'pre-auto-gc',
            ],
            pathPattern: '^(?:gitHooks|husky|simple-git-hooks)$',
          },
        ],
      },
      jsPlugins: ['eslint-plugin-jsonc'],
    },
    {
      files: ['**/[jt]sconfig.json', '**/[jt]sconfig.*.json'],
      rules: {
        'jsonc/sort-keys': [
          'error',
          {
            order: [
              'extends',
              'compilerOptions',
              'references',
              'files',
              'include',
              'exclude',
            ],
            pathPattern: '^$',
          },
          {
            order: [
              'incremental',
              'composite',
              'tsBuildInfoFile',
              'disableSourceOfProjectReferenceRedirect',
              'disableSolutionSearching',
              'disableReferencedProjectLoad',
              'target',
              'jsx',
              'jsxFactory',
              'jsxFragmentFactory',
              'jsxImportSource',
              'lib',
              'moduleDetection',
              'noLib',
              'reactNamespace',
              'useDefineForClassFields',
              'emitDecoratorMetadata',
              'experimentalDecorators',
              'libReplacement',
              'baseUrl',
              'rootDir',
              'rootDirs',
              'customConditions',
              'module',
              'moduleResolution',
              'moduleSuffixes',
              'noResolve',
              'paths',
              'resolveJsonModule',
              'resolvePackageJsonExports',
              'resolvePackageJsonImports',
              'typeRoots',
              'types',
              'allowArbitraryExtensions',
              'allowImportingTsExtensions',
              'allowUmdGlobalAccess',
              'allowJs',
              'checkJs',
              'maxNodeModuleJsDepth',
              'strict',
              'strictBindCallApply',
              'strictFunctionTypes',
              'strictNullChecks',
              'strictPropertyInitialization',
              'allowUnreachableCode',
              'allowUnusedLabels',
              'alwaysStrict',
              'exactOptionalPropertyTypes',
              'noFallthroughCasesInSwitch',
              'noImplicitAny',
              'noImplicitOverride',
              'noImplicitReturns',
              'noImplicitThis',
              'noPropertyAccessFromIndexSignature',
              'noUncheckedIndexedAccess',
              'noUnusedLocals',
              'noUnusedParameters',
              'useUnknownInCatchVariables',
              'declaration',
              'declarationDir',
              'declarationMap',
              'downlevelIteration',
              'emitBOM',
              'emitDeclarationOnly',
              'importHelpers',
              'importsNotUsedAsValues',
              'inlineSourceMap',
              'inlineSources',
              'mapRoot',
              'newLine',
              'noEmit',
              'noEmitHelpers',
              'noEmitOnError',
              'outDir',
              'outFile',
              'preserveConstEnums',
              'preserveValueImports',
              'removeComments',
              'sourceMap',
              'sourceRoot',
              'stripInternal',
              'allowSyntheticDefaultImports',
              'esModuleInterop',
              'forceConsistentCasingInFileNames',
              'isolatedDeclarations',
              'isolatedModules',
              'preserveSymlinks',
              'verbatimModuleSyntax',
              'erasableSyntaxOnly',
              'skipDefaultLibCheck',
              'skipLibCheck',
            ],
            pathPattern: '^compilerOptions$',
          },
        ],
      },
      jsPlugins: ['eslint-plugin-jsonc'],
    },
    {
      files: ['**/*.y?(a)ml'],
      rules: {
        'yml/block-mapping': 'error',
        'yml/block-sequence': 'error',
        'yml/no-empty-key': 'error',
        'yml/no-empty-sequence-entry': 'error',
        'yml/no-irregular-whitespace': 'error',
        'yml/plain-scalar': 'error',
      },
      jsPlugins: ['eslint-plugin-yml'],
    },
    {
      files: ['**/*.js', '**/*.cjs'],
      rules: {
        'typescript/no-require-imports': 'off',
      },
      plugins: ['typescript'],
    },
    {
      files: ['**/*.config.ts'],
      rules: {
        'import/no-default-export': 'off', // Configs usually require a default export
        'typescript/explicit-function-return-type': 'off',
      },
      plugins: ['typescript', 'import'],
    },
  ],
};

export default config;
