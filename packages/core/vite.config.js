import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';
import dts from 'vite-plugin-dts';
var ReactCompilerConfig = {
/* ... */
};
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), 'VITE_');
    console.log(env);
    return {
        define: {
            'process.env': {},
            global: 'window',
        },
        build: {
            lib: {
                entry: path.resolve(__dirname, 'src/index.tsx'),
                name: 'JigooooUi',
                fileName: function (format) { return "index.".concat(format === 'es' ? 'js' : 'umd.cjs'); },
                formats: ['es'],
            },
            rollupOptions: {
                external: ['react', 'react-dom', 'react/jsx-runtime'],
                output: {
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM',
                        'react/jsx-runtime': 'React',
                    },
                },
            },
            cssCodeSplit: false,
            sourcemap: false,
            emptyOutDir: true,
        },
        plugins: [
            dts({
                insertTypesEntry: true,
                include: ['src/**/*'],
                exclude: ['src/**/*.test.*', 'src/**/*.stories.*'],
            }),
            svgr({
                svgrOptions: {},
            }),
            react({
                babel: {
                    plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
                },
            }),
            tsconfigPaths(),
            ViteImageOptimizer({
                test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
                exclude: undefined,
                include: undefined,
                includePublic: true,
                logStats: true,
                ansiColors: true,
                svg: {
                    multipass: true,
                    plugins: [
                        {
                            name: 'preset-default',
                            params: {
                                overrides: {
                                    cleanupNumericValues: false,
                                    removeViewBox: false, // https://github.com/svg/svgo/issues/1128
                                },
                                // cleanupIDs: {
                                //   minify: false,
                                //   remove: false,
                                // },
                                // convertPathData: false,
                            },
                        },
                        'sortAttrs',
                        {
                            name: 'addAttributesToSVGElement',
                            params: {
                                attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
                            },
                        },
                    ],
                },
                png: {
                    // https://sharp.pixelplumbing.com/api-output#png
                    quality: 100,
                },
                jpeg: {
                    // https://sharp.pixelplumbing.com/api-output#jpeg
                    quality: 100,
                },
                jpg: {
                    // https://sharp.pixelplumbing.com/api-output#jpeg
                    quality: 100,
                },
                tiff: {
                    // https://sharp.pixelplumbing.com/api-output#tiff
                    quality: 100,
                },
                // gif does not support lossless compression
                // https://sharp.pixelplumbing.com/api-output#gif
                gif: {},
                webp: {
                    // https://sharp.pixelplumbing.com/api-output#webp
                    lossless: false,
                },
                avif: {
                    // https://sharp.pixelplumbing.com/api-output#avif
                    lossless: true,
                },
                cache: false,
                cacheLocation: undefined,
            }),
        ],
        assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.otf'],
    };
});
