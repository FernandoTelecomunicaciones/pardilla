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
  lib/jornada.js     Análisis del registro horario y detección de olvidos
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

**El orden importa, y hay dos reglas que no se pueden saltar:**

1. **Los índices, siempre los primeros.** Son aditivos: habilitan consultas y
   nunca deniegan nada, así que desplegarlos antes de tiempo no rompe nada.
   Desplegarlos tarde, en cambio, deja pantallas con el error "The query requires
   an index".
2. **Las reglas van con el código, no antes.** Las reglas están acopladas a las
   consultas que hace el cliente: si publicas reglas nuevas mientras los
   empleados siguen con la versión anterior instalada, sus consultas dejan de
   estar permitidas y esas pantallas se quedan vacías. Publica primero la web (y
   distribuye el APK, si lo usan) y las reglas **a la vez o justo después**.
   Cuando cambies reglas y consultas en la misma versión, coordina el paso: los
   usuarios con el APK antiguo no pueden "recargar" para actualizarse.

Y el aviso de actualización se dispara al escribir en Firestore, así que ese paso
va el último: si se hace antes, el botón "Actualizar ahora" lleva a algo que
todavía no existe.

1. **Subir la versión** en `src/App.jsx` → `const APP_VERSION = "6.4";`
2. **Comprobaciones** (los tests de reglas necesitan el JDK 21, ver arriba)
   ```bash
   npm ci
   npm run lint
   npm test
   npx firebase emulators:exec --only auth,firestore --project demo-pardilla "node --test tests/firestore.test.mjs"
   npm run build
   ```
3. **Índices de Firestore** (primero, son inocuos):
   ```bash
   firebase deploy --only firestore:indexes
   ```
   Tardan unos minutos en construirse en colecciones grandes.
4. **Web y reglas, juntas** (ver la advertencia de arriba):
   ```bash
   firebase deploy --only hosting,firestore:rules
   ```
5. **Android** (si se distribuye APK)
   ```bash
   npx cap sync android
   # generar el APK firmado desde Android Studio
   ```
6. **Release en GitHub** con etiqueta `v6.4` y el APK como adjunto, para que
   `releases/latest` apunte a un archivo real.
7. **Último paso — activar el aviso**: en Firestore, documento
   `config/app_version`:
   ```json
   { "version": "6.4", "apkUrl": "<url del APK>", "webUrl": "https://pasteleria-pardilla.web.app" }
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

## Turnos de tienda: los tres modos

La tienda se cubre de una de estas tres formas, y la app elige sola cuál aplica:

| Modo | Cuándo | Turnos | Rota |
|---|---|---|---|
| **Normal** | 3 dependientes | A / B / C | cada semana, mód. 3 |
| **Verano** | 1 jun – 31 ago, automático | V1 / V2 | cada semana, mód. 2 |
| **2 dependientes** | manual: baja, vacante… | Especial A / B | cada semana, mód. 2 |

**Verano y 2 dependientes usan el mismo cuadrante** (`SHIFT_TEMPLATES_2P` en
`src/App.jsx`), porque son la misma situación: la tienda cubierta entre dos. Está
definido **una sola vez** y los dos nombres apuntan a él — si algún día retocas
una hora, no se descuadran entre sí. Ambos turnos suman exactamente 40 h.

### Activar el modo 2 dependientes

**Turnos → Modo 2 dependientes → marcar la casilla.** Al activarlo propone a
Víctor y María de los Ángeles, pero puedes cambiar quién entra y en qué turno
empieza cada uno. Mientras esté activo:

- Sustituye a A/B/C **y también al automatismo de verano**, porque lo enciendes tú
  a propósito. En julio con el modo activo se sigue viendo "Especial", no "V1".
- Quien no esté asignado se queda sin turno de tienda: es justo el hueco a cubrir.
- La app avisa si no hay exactamente dos personas, o si las dos empiezan en el
  mismo turno (coincidirían siempre y quedarían días descubiertos).

Al contratar al tercer dependiente, **desmarca la casilla** y vuelve A/B/C sin
tocar nada más: las asignaciones normales siguen guardadas.

---

## Registro horario: qué hacer con los olvidos

Es el punto donde más sistemas fallan. La regla de oro: **nunca se cierra una
jornada automáticamente**. El art. 34.9 del ET exige la *hora concreta* de inicio
y fin; una salida inventada a una hora fija no es un hecho, y un registro con
horas fabricadas se vuelve en contra de la empresa en cuanto alguien lo mira de
cerca.

Lo que sí es válido es **dejarlo abierto y subsanarlo con traza**:

1. La app detecta las entradas sin salida de los últimos 14 días y avisa al
   trabajador en su pantalla de fichar, con un botón para cerrarlas.
2. El trabajador declara la hora real (se le propone el fin de su turno, pero
   puede cambiarla), la acepta y **la firma**. Esa es la prueba más sólida: nadie
   discute después una hora que él mismo declaró y firmó.
3. El apunte se guarda como un registro **nuevo**, nunca editando el original —
   que sigue siendo inmutable por reglas. Lleva `corrigeA` (a qué entrada
   corrige), `motivo`, `origenCorreccion` y, sobre todo, dos tiempos distintos:

   | Campo | Significa |
   |---|---|
   | `time` | La hora **declarada**: cuándo terminó de verdad |
   | `fechaFichaje` | El momento **del apunte**: cuándo se rellenó |

   Que se vean por separado es lo que lo hace defendible. Un apunte creado a las
   09:12 declarando una salida de las 20:45 es correcto si consta como
   regularización firmada; es fraude si se disfraza de fichaje normal.
4. En **Fichar → (admin)** tienes un panel de incidencias del periodo buscado con
   las jornadas que nadie cerró. El CSV exporta toda la trazabilidad.

**Lo que todavía tienes que hacer tú, fuera de la app:** redactar el *documento de
organización del registro* (art. 34.9: convenio, acuerdo de empresa o decisión
del empresario previa consulta a los representantes). Un folio que diga qué
sistema se usa, cómo se ficha, qué se hace ante un olvido, quién puede
regularizar, cómo accede el trabajador a sus datos y cuánto se conservan. Tener
la app perfecta sin ese papel es cumplir media obligación. Revisa además si tu
convenio de pastelería exige registrar las pausas.

> Esto es criterio técnico de diseño, no asesoramiento jurídico. El marco del
> art. 34.9 es estable desde 2019, pero el registro horario ha estado en reforma
> activa. Confirma con tu gestoría o un graduado social antes de darlo por
> cerrado.

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
