// https://github.com/vitejs/vite/discussions/4085
// https://dev.to/leon/vite-lit-and-storybook-43f
import { resolve } from "path";
import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    if (mode === "demo") {
        return {
            base: "tei-processing/seed-frontend-components",
            build: {
                outDir: "demo",
                assetsDir: "examples",
                rollupOptions: {
                    // 	external: mode === "production" ? "" : /^lit/,
                    input: {
                        // add examples
                        examples: resolve(__dirname, "index.html"),
                        synopsis: resolve(__dirname, "examples/synopsis.html"),
                        figures: resolve(__dirname, "examples/figures.html"),
                    },
                },
            },
            publicDir: false, // do not copy /public
            plugins: [
                viteStaticCopy({
                    targets: [
                        {
                            src: normalizePath(
                                resolve(__dirname, "examples/*.json"),
                            ),
                            dest: "examples",
                        },
                        {
                            src: normalizePath(
                                resolve(__dirname, "examples/*.tei*html"),
                            ),
                            dest: "examples",
                        },
                    ],
                }),
            ],
        };
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
            },
        },
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
    };
});
