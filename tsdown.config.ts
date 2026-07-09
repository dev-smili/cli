import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/main.ts'],
  format: 'esm',
  target: 'node20',
  clean: true,
  // Emit `.js` (valid ESM given `"type": "module"`) so `bin` resolves to dist/main.js.
  fixedExtension: false,
  // CLI has no importable API; enable if you export functions for consumers later.
  dts: false,
})
