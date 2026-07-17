import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

const root = import.meta.dirname;
const src = path.resolve(root, 'src');

/** Directory roots so bare `@layer` → index and `@layer/foo` → src/layer/foo. */
function layerAlias(name: string): Record<string, string> {
  const dir = path.resolve(src, name);
  return {
    [`@${name}`]: dir,
  };
}

export default defineConfig({
  plugins: [solid(), tailwindcss()],
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
});
