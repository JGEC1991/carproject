import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      server: {
        host: '0.0.0.0',
        allowedHosts: [
          'acce30ef-6861-4144-87f3-6c3e026781cb-00-192ofkrvtj16x.riker.replit.dev',
          '.replit.dev'
        ]
      }
    })
