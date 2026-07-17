import type { OxfmtConfig } from 'oxfmt';

const config: OxfmtConfig = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.stryker-tmp/',
    'coverage/',
    'reports/',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    '*.tsbuildinfo',
    '.DS_Store',
  ],
};

export default config;
