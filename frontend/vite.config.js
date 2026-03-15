import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/auth/login": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/auth/login.php',
      },
      "/api/auth/logout": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/auth/logout.php',
      },
      "/api/users": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/users/index.php',
      },
      "/api/consultants": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/consultants/index.php',
      },
      "/api/categories": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/categories/index.php',
      },
      "/api/admin-notifications": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/admin-notifications/index.php',
      },
    },
  },
})