import react from '@vitejs/plugin-react'
import inertia from '@inertiajs/vite'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import path from 'path'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    inertia(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'app/frontend'),
    },
  },
  server: {
    // 允许局域网访问
    host: '0.0.0.0',
    port: 3036,

    hmr: {
      // HMR WebSocket 直连 Vite 端口，不走 Rails 代理
      clientPort: 3036,
    },
    allowedHosts: ['dev.chaofan.live', '.chaofan.live', 'localhost', '127.0.0.1', '192.168.0.14']
  },
})
