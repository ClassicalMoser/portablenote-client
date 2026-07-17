import type { OxlintConfig } from 'oxlint';
import boundaries from './oxlintBoundaries.config.ts';
import ignorePatterns from './oxlintIgnorePatterns.config.ts';
import disableJestRules from './oxlintDisableJestRules.config.ts';
import regexp from './oxlintRegexp.config.ts';
import solid from './oxlintSolid.config.ts';

const config: OxlintConfig = {
  extends: [boundaries, ignorePatterns, disableJestRules, regexp, solid],
};

export default config;
