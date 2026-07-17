import type { OxlintConfig } from 'oxlint';
import { boundaries } from '../boundaries.ts';

const config: OxlintConfig = {
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.js'],
      jsPlugins: ['eslint-plugin-import-boundaries'],
      rules: {
        'import-boundaries/enforce': [
          'error',
          {
            rootDir: 'src',
            rootDirAlias: '',
            boundaries,
          },
        ],
      },
    },
    {
      files: [
        '**/*.test.{ts,js}',
        '**/*.spec.{ts,js}',
        '**/*.mock.{ts,js}',
        '**/__tests__/**',
        '**/__mocks__/**',
      ],
      jsPlugins: ['eslint-plugin-import-boundaries'],
      rules: {
        'import-boundaries/enforce': [
          'error',
          {
            rootDir: 'src',
            boundaries,
            enforceBoundaries: false,
          },
        ],
      },
    },
  ],
};

export default config;
