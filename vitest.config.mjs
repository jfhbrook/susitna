import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    exclude: [
      "tools/**",
      "node_modules/**",
      "tap-snapshots/**"
    ]
  }
});
