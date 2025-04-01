// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/readhub': {
                target: 'https://readhub.cn',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/readhub/, '')
            },
            '/api/ithome': {
                target: 'https://www.ithome.com/rss/',  // 目标 URL
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/ithome/, '') // 重写路径
              }
        }
    }
});