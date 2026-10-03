import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Workspace packages ship as TypeScript source, so they are bundled into the build.
  // Everything else in node_modules stays external and is installed in the runtime image.
  noExternal: [/^@seoflow\//],
});
