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
      "/api/auth/user-login": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/auth/user-login.php',
      },
      "/api/auth/register": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/auth/register.php',
      },
      "/api/auth/logout": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/auth/logout.php',
      },
      "/api/users": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/users', '/FinHub/backend/ws/users/index.php'),
      },
      "/api/public/consultants": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/public/consultants.php',
      },
      "/api/consultants": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/consultants', '/FinHub/backend/ws/consultants/index.php'),
      },
      "/api/categories": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/categories', '/FinHub/backend/ws/categories/index.php'),
      },
      "/api/admin-notifications": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/admin-notifications', '/FinHub/backend/ws/admin-notifications/index.php'),
      },
      "/api/user-notifications": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/user-notifications', '/FinHub/backend/ws/user-notifications/index.php'),
      },
      "/api/user-dashboard": {
          target: "http://localhost",
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/user-dashboard', '/FinHub/backend/ws/user-dashboard/index.php'),
      },
      "/api/dashboard": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/dashboard', '/FinHub/backend/ws/dashboard/index.php'),
      },
      "/api/currencies": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/currencies', '/FinHub/backend/ws/currencies/index.php'),
      },
      "/api/accounts": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/accounts', '/FinHub/backend/ws/accounts/index.php'),
      },
      "/api/transactions/scan-receipt": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/transactions/scan-receipt.php',
      },
      "/api/transactions/import": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/transactions/import.php',
      },
      "/api/transactions": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/transactions', '/FinHub/backend/ws/transactions/index.php'),
      },
    },
  },
})
