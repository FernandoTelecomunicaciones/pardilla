import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: { entries: ['index.html'] },
  build: {
    // El SDK de Firebase pesa más que la app entera y cambia muy de vez en
    // cuando. Separándolo en su propio chunk, y con la cabecera `immutable` que
    // firebase.json aplica a /assets/*, publicar una versión nueva de la app ya
    // no obliga a los empleados a volver a descargar Firebase entero.
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) exige la forma de función.
        manualChunks: (id) => (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase') ? 'firebase' : undefined),
      },
    },
  },
  test: { include: ['src/**/*.test.js', 'src/**/*.test.jsx'] },
})
