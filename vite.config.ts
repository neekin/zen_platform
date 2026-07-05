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
    // HMR 配置：使用客户端实际访问的地址
    hmr: {
      // 不设置 host，让 Vite 从请求中自动获取
      // 设置 clientPort 为 Vite 端口
      clientPort: 3036,
    },
  },
})
