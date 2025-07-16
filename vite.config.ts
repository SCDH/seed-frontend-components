// https://github.com/vitejs/vite/discussions/4085
// https://dev.to/leon/vite-lit-and-storybook-43f
/// <reference types="vitest/config" />
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, normalizePath } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    if (mode === "redux") {
        return {
            build: {
                outDir: "./dist/redux",
                lib: {
                    entry: resolve(__dirname, "./src/redux/main.ts"),
                    name: "SEED Frontend State",
                    fileName: "main",
                    formats: ["es"],
                },
                // rollupOptions: {
                //     external: ['lit'],
                // },
            },
            plugins: [dts({ include: ["src/redux"] })],
        };
    }
    return {
        build: {
            lib: {
                entry: resolve(__dirname, "./src/main.ts"),
                name: "SEED Frontend Components",
                fileName: "main",
                formats: ["es"],
            },
            // rollupOptions: {
            //     external: ['lit'],
            // },
        },
        define: { "process.env.NODE_ENV": '"production"' },
        plugins: [dts({ include: ["src"] })],
        server: {
            // proxy for Solr dev server listening on localhost:8983
            proxy: {
                "/solr": {
                    target: "http://localhost:8983/",
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        test: {
            include: ["test/**/*.test.ts"],
            name: "SEED",
            setup: ["test/**/*.setup.ts"],
        },
    };
});
