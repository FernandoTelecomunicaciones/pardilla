import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'android', '5.3back', 'v4.12', 'v5.0', 'v5.1', 'v5.2', 'v5.3', 'Versiones anteriores', 'App.jsx', '.audit']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Aviso, no error. La app tiene cinco efectos de arranque legítimos que
      // esta regla marca: init de Firebase, comprobación del primer usuario,
      // alta del listener de fichajes y las dos acumulaciones (mensual y de
      // festivos) que corren una vez por sesión. Son patrones correctos de
      // bootstrap/suscripción; reescribirlos para contentar a una regla de
      // estilo tocaría la ruta de autenticación sin ganancia real. Se dejan
      // visibles como warning para revisarlos si algún día se refactoriza.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
