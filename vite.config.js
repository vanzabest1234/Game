import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The preview proxy forwards a sandbox Host header; Vite >= 6.1 accepts extra
// allowed hosts through __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS, supplied by the
// environment compose file, so no host allowlist lives in this config.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
