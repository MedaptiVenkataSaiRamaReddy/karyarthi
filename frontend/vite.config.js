import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    server: {
      // Dev: proxy all /api calls to Spring Boot
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8081',
          changeOrigin: true,
        }
      }
    },

    build: {
      // When building with Spring Boot as host, output into its static dir
      outDir: '../src/main/resources/static',
      emptyOutDir: true,
    },

    define: {
      // Make env vars accessible as import.meta.env.VITE_*
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    }
  }
})
