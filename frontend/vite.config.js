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
      "/api/auth/verify-email": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/auth/verify-email.php',
      },
      "/api/profile": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/profile', '/FinHub/backend/ws/profile/index.php'),
      },
      "/api/users": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/users', '/FinHub/backend/ws/users/index.php'),
      },
      "/api/user-consultants": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/user-consultants', '/FinHub/backend/ws/user-consultants/index.php'),
      },
      "/api/chat": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/chat', '/FinHub/backend/ws/chat/index.php'),
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
      "/api/my-notifications": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/my-notifications', '/FinHub/backend/ws/my-notifications/index.php'),
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
      "/api/exchange-rate": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/exchange-rate', '/FinHub/backend/ws/exchange-rate/index.php'),
      },
      "/api/goals/contributions": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/goals/contributions', '/FinHub/backend/ws/goals/index.php'),
      },
      "/api/goals": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/goals', '/FinHub/backend/ws/goals/index.php'),
      },
      "/api/investments/analyze-single": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/investments/analyze-single.php',
      },
      "/api/investments/analyze": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/investments/analyze.php',
      },
      "/api/investments/update-prices": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/investments/update-prices.php',
      },
      "/api/investments": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/investments', '/FinHub/backend/ws/investments/index.php'),
      },
      "/api/reminders/send-due": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/reminders/send-due.php',
      },
      "/api/reminders/weekly-summary": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: () => '/FinHub/backend/ws/reminders/weekly-summary.php',
      },
      "/api/reminders": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/reminders', '/FinHub/backend/ws/reminders/index.php'),
      },
      "/api/bills": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/bills', '/FinHub/backend/ws/bills/index.php'),
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