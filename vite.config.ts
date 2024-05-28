// https://github.com/vitejs/vite/discussions/4085
// https://dev.to/leon/vite-lit-and-storybook-43f
import { resolve } from 'path'
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    if (mode === 'examples') {
	return {
	    base: "tei-processing/seed-frontend-components",
	    build: {
		outDir: "dist_examples",
		assetsDir: "examples",
		rollupOptions: {
		    // 	external: mode === "production" ? "" : /^lit/,
		    input: {
			// add examples
			examples: resolve(__dirname, 'index.html'),
			synopsis: resolve(__dirname, 'examples/synopsis.html'),
			figures: resolve(__dirname, 'examples/figures.html'),
		    }
		}
	    },
	    publicDir: false, // do not copy public
	    assetsInclude: ["examples/*.json"],
	}
    }
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
