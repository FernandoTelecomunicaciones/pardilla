# Pastelería Pardilla — App de gestión

Aplicación interna de gestión para Pastelería Pardilla (Alcorcón, Madrid): turnos
rotativos de tienda y obrador, fichajes con firma, vacaciones, tareas, buzón de
sugerencias y un asesor de negocio con IA.

© Fernando Sanz García — Todos los derechos reservados. Aplicación y código
registrados a su nombre. Prohibida su reproducción o distribución sin
autorización expresa.

---

## Tecnologías

| Pieza | Elección |
|---|---|
| Frontend | React 19 + Vite 8 (JavaScript, sin TypeScript) |
| Estilos | Sistema de diseño propio inyectado desde `src/App.jsx` |
| Backend | Firebase (sin servidor propio) |
| Base de datos | Cloud Firestore |
| Autenticación | Firebase Auth (email + contraseña) |
| SDK de Firebase | Paquete npm `firebase` (API compat), empaquetado en el bundle |
| Hosting web | Firebase Hosting → https://pasteleria-pardilla.web.app |
| App Android | Capacitor (carpeta `android/`) |
| IA | API de Anthropic (Claude), llamada directa desde el navegador |
| Tests | Vitest (lógica) + emulador de Firebase (reglas de seguridad) |

**No hay backend propio.** Toda la autorización real vive en `firestore.rules`:
los `role === "admin"` de React solo ocultan botones y cualquiera puede saltárselos
desde la consola del navegador.

---

## Estructura

```
src/
  App.jsx            Toda la aplicación (pantallas, modales y estilos)
  firebase.js        Carga del SDK, config por entorno y conexión a emuladores
  lib/core.js        Lógica pura: fechas, rotación de turnos, versiones
  lib/vacations.js   Firma de vacaciones (transacción atómica firma + saldo)
  lib/*.test.js      Tests de esa lógica
  main.jsx           Punto de entrada
  index.css          Base mínima (no debe competir con los estilos de App.jsx)
tests/
  firestore.test.mjs Tests de las reglas de seguridad contra el emulador
  seed-emulators.mjs Datos de partida para los emuladores
firestore.rules         Reglas de seguridad (¡esto es la autorización real!)
firestore.indexes.json  Índices compuestos que necesitan las consultas
firebase.json           Hosting + Firestore + emuladores
```

El SDK de Firebase va **empaquetado** (no por CDN): `src/firebase.js` lo importa
y lo publica en `window.firebase`, que es como lo consume `src/App.jsx`. Por eso
`index.html` ya no lleva ningún `<script>` de gstatic.

---

## Puesta en marcha

```bash
npm install
npm run dev          # desarrollo en http://localhost:5173
```

### Configuración de Firebase

La app busca la configuración en este orden:

1. `FIREBASE_CONFIG_HARDCODED` en `src/App.jsx` (normalmente `null`).
2. Variables de entorno de build (recomendado) — copia `.env.example` a `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   ```
3. Configuración guardada en el dispositivo (pantalla de configuración inicial).

Si no encuentra ninguna, muestra la pantalla de configuración manual.

> La clave web de Firebase **es pública por diseño**: viaja en el bundle de todas
> formas. Lo que protege los datos son las reglas de Firestore, no ocultarla.
> Lo que **nunca** debe ir en `.env` ni en el repositorio son claves de cuenta de
> servicio ni la clave de la API de Anthropic.

### Clave de la API de IA

No se configura por entorno: cada administrador la introduce en
**Asesor IA → Configuración** y queda guardada **solo en ese dispositivo**
(`localStorage`), nunca en Firestore.

---

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm run build      # build de producción a dist/
npm run preview    # sirve el build de producción en local
npm run lint       # ESLint
npm test           # tests de lógica (una pasada)
npm run test:watch # tests de lógica en modo vigilancia
npm run emulators  # emuladores de Auth y Firestore en local
npm run test:rules # tests de las reglas de seguridad (requiere emulador)
```

### Tests de reglas: hace falta JDK 21

Los emuladores de Firebase **exigen Java 21 o superior**; con Java 8 fallan con
`firebase-tools no longer supports Java version before 21`. Si tienes Android
Studio instalado ya tienes un JDK 21 válido en su JBR, no hace falta instalar
nada:

```bash
# Windows (PowerShell) — solo para esta sesión de terminal
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Arranca los emuladores, pasa los tests y los apaga solo:
npx firebase emulators:exec --only auth,firestore --project demo-pardilla "node --test tests/firestore.test.mjs"
```

Estos tests son la red de seguridad del proyecto: comprueban que un empleado no
puede ascenderse a administrador, leer reportes confidenciales ajenos, tocar
fichajes de otros ni firmar vacaciones que no son suyas. **Ejecútalos siempre que
toques `firestore.rules` o cualquier consulta a Firestore**, porque en Firestore
las reglas no filtran: si una consulta del cliente puede devolver un documento no
permitido, la consulta falla entera y la pantalla se queda vacía.

---

## Primer administrador

Las reglas impiden que nadie se asigne un rol a sí mismo (sería escalar
privilegios). El primer admin se siembra **a mano**:

1. Firebase Console → Authentication → añadir usuario con email y contraseña.
2. Firestore → colección `users` → documento con **ID igual al UID** de ese
   usuario y estos campos:
   ```json
   {
     "uid": "<UID>",
     "email": "...",
     "name": "...",
     "role": "admin",
     "linkedEmployeeId": null,
     "createdAt": "2026-01-01T00:00:00.000Z"
   }
   ```

A partir de ahí el resto de usuarios se crean desde **Usuarios** dentro de la app.

---

## Despliegue

Requisito: `npm install -g firebase-tools` y `firebase login`.

**El orden importa.** El aviso de actualización se dispara al escribir en
Firestore, así que ese paso va el último: si se hace antes, el botón
"Actualizar ahora" lleva a algo que todavía no existe.

1. **Subir la versión** en `src/App.jsx` → `const APP_VERSION = "6.1";`
2. **Comprobaciones** (los tests de reglas necesitan el JDK 21, ver arriba)
   ```bash
   npm ci
   npm run lint
   npm test
   npx firebase emulators:exec --only auth,firestore --project demo-pardilla "node --test tests/firestore.test.mjs"
   npm run build
   ```
3. **Reglas e índices de Firestore** (antes que la web, para que los datos ya
   estén protegidos cuando entre el código nuevo):
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
4. **Web**
   ```bash
   firebase deploy --only hosting
   ```
5. **Android** (si se distribuye APK)
   ```bash
   npx cap sync android
   # generar el APK firmado desde Android Studio
   ```
6. **Release en GitHub** con etiqueta `v6.1` y el APK como adjunto, para que
   `releases/latest` apunte a un archivo real.
7. **Último paso — activar el aviso**: en Firestore, documento
   `config/app_version`:
   ```json
   { "version": "6.1", "apkUrl": "<url del APK>", "webUrl": "https://pasteleria-pardilla.web.app" }
   ```

---

## Rollback

| Qué falla | Cómo se revierte |
|---|---|
| Web | `firebase hosting:releases:list` y `firebase hosting:rollback`, o volver a desplegar el commit anterior. Es inmediato. |
| Aviso de actualización | Poner `version` en `config/app_version` de vuelta al valor anterior. Los clientes dejan de ver el banner. |
| Reglas de Firestore | Firebase Console → Firestore → Reglas → historial de versiones → publicar la anterior. |
| Android | Publicar de nuevo el APK anterior en GitHub Releases y apuntar `apkUrl` a él. |
| Código | `git revert <commit>` en la rama `vscode`. La rama `pruebas` conserva una copia de seguridad del estado anterior. |

Los datos de Firestore **no** se revierten con el código: si un despliegue
escribiera datos incorrectos, hay que restaurarlos desde una exportación.

---

## Cumplimiento (RGPD / RDL 8/2019)

- Los fichajes (`registros_horarios`) llevan firma manuscrita y un hash de
  integridad, y las reglas los hacen **inmutables**: nadie puede editarlos ni
  borrarlos desde la app. Se conservan 4 años.
- El buzón de sugerencias admite reportes **anónimos**: cuando se marca así, el
  documento se guarda sin `employeeId` ni `employeeName`, y las reglas rechazan
  un reporte anónimo que traiga identidad adjunta.
- Un empleado solo puede descargar sus propios reportes; los confidenciales
  ajenos no salen del servidor.

---

## Limitaciones conocidas

- **Clave de IA en el navegador.** La llamada a Anthropic se hace desde el
  cliente con la clave en `localStorage`. Es aceptable porque solo la introduce
  el administrador en su propio dispositivo, pero cualquiera con acceso físico a
  ese dispositivo puede leerla. La alternativa sería una Cloud Function.
- **Festivos cargados a mano** en `HOLIDAYS_BY_YEAR` (`src/App.jsx`): solo están
  2026 y 2027. El calendario laboral lo publica el BOE cada año, así que hay que
  ampliarlo a mano. **Añade 2028 antes de que acabe 2027.** Si se agota, la app
  muestra un aviso rojo al administrador: sin esos datos, los festivos trabajados
  dejarían de sumarse a las vacaciones del equipo.
- **Peso de la descarga inicial.** Al empaquetar Firebase, la primera visita
  descarga ~310 kB comprimidos. Va en un chunk aparte con cabecera `immutable`,
  así que las actualizaciones posteriores de la app solo bajan ~104 kB.
- **Borrar un usuario** elimina su ficha de `users`, no su cuenta de Firebase
  Auth. Podrá autenticarse pero verá la pantalla "Sin acceso"; para eliminarlo
  del todo hay que borrarlo también en Authentication.
