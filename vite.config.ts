// https://github.com/vitejs/vite/discussions/4085
// https://dev.to/leon/vite-lit-and-storybook-43f
import { resolve } from "path";
import { defineConfig, normalizePath } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    return {
        build: {
            lib: {
                entry: resolve(__dirname, "./src/main.ts"),
                name: "SEED Frontend Components",
                fileName: "main",
                formats: ["es"],
            },
            rollupOptions: {
                // 	external: mode === "production" ? "" : /^lit/,
            },
        },
        plugins: [dts({ include: ["src"] })],
    };
});
