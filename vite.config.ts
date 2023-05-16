import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ui-colors-from-an-image/',
  server: {
    port: 1234,
    host: '0.0.0.0',
  },
});
