import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
    // Set base to the repository name so built assets use the correct path on GitHub Pages
    base: '/WinUIonWeb/',
    plugins: [plugin()],
    server: {
        port: 63179,
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                blog: resolve(__dirname, 'blog.html')
            }
        }
    }
})
