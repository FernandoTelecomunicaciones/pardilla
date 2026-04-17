# Configuración de Firebase para Pastelería Pardilla v3

Para implementar la versión 3 con Firestore, sigue estos pasos:

## 1. Crear proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Crea un nuevo proyecto llamado "pardilla-app"
3. Habilita Firestore Database
4. Crea una app web y copia la configuración

## 2. Configurar Firebase en el código

Edita el archivo `src/firebase.js` y reemplaza la configuración con tus datos reales de Firebase.

## 3. Ejecutar la app

Una vez configurado, la app migrará automáticamente los datos locales a Firestore.

**Nota:** Asegúrate de configurar las reglas de seguridad de Firestore para permitir lecturas/escrituras desde tu dominio.