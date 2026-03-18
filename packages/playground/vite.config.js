import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
var ReactCompilerConfig = {
/* ... */
};
export default defineConfig(function () {
    return {
        server: {
            port: 3000,
            open: true,
        },
        define: {
            'process.env': {},
            global: 'window',
        },
        plugins: [
            svgr({
                svgrOptions: {},
            }),
            react({
                babel: {
                    plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
                },
            }),
            tsconfigPaths(),
        ],
        assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.otf'],
    };
});
