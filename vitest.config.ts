import path from 'node:path';
import { defineConfig } from 'vitest/config';

const src = path.resolve(import.meta.dirname, 'src');

function layerAlias(name: string): Record<string, string> {
  return { [`@${name}`]: path.resolve(src, name) };
}

export default defineConfig({
  resolve: {
    alias: {
      ...layerAlias('application'),
      ...layerAlias('composition'),
      ...layerAlias('domain'),
      ...layerAlias('infrastructure'),
      ...layerAlias('interface'),
      ...layerAlias('ports'),
    },
  },
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});
