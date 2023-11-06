// https://github.com/vitejs/vite/discussions/4085
// https://dev.to/leon/vite-lit-and-storybook-43f
import { resolve } from 'path'
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
	build: {
	    lib: {
		entry: [resolve(__dirname, "src/isynopsis.ts"),
			resolve(__dirname, "src/seed-synopsis.ts"),
			resolve(__dirname, "src/seed-synopsis-text.ts"),
			resolve(__dirname, "src/seed-transform-rest.ts"),
			resolve(__dirname, "src/seed-transform-sef.ts"),
			resolve(__dirname, "src/seed-transform-forms.ts"),
			resolve(__dirname, "src/transformation-api-client.ts"),
			resolve(__dirname, "src/xsform.ts"),
			resolve(__dirname, "src/workaround-transformer-api.ts"),
			resolve(__dirname, "src/saxon-js-workaround.ts"),
			resolve(__dirname, "src/itextview.ts"),
			resolve(__dirname, "src/seed-download-link.ts"),
			resolve(__dirname, "src/seed-synopsis-text.ts")
		       ],
		//entry: resolve(__dirname, "./src/main.ts"),
		name: "SeedFrontendComponents",
		fileName: "seed-frontend-components",
		formats: ["es", "cjs"],
	    },
	    rollupOptions: {
	    // 	external: mode === "production" ? "" : /^lit/,
	    },
	},
  }
});
