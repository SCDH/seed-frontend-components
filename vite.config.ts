// https://github.com/vitejs/vite/discussions/4085
// https://dev.to/leon/vite-lit-and-storybook-43f
import { resolve } from 'path'
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
	build: {
	    lib: {
		entry: resolve(__dirname, "./src/main.ts"),
		name: "SeedFrontendComponents",
		fileName: "seed-frontend-components",
		formats: ["es", "cjs"],
	    },
	    rollupOptions: {
		// 	external: mode === "production" ? "" : /^lit/,
	    }
	},
  }
});
