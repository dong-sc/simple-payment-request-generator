import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/simple-payment-request-generator/',
  plugins: [react()],
});
