// https://github.com/vitejs/vite/discussions/4085

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    return {
	build: {
	    lib: {
		entry: ["src/seed/components/seed-synopsis.ts",
			"src/seed/components/seed-synopsis-text.ts"],
		// fileName: "seed-synopsis-components",
		// formats: ["es", "cjs"],
	    },
	    // rollupOptions: {
	    // 	external: mode === "production" ? "" : /^seed-synopsis/,
	    // },
	},
    };
});
