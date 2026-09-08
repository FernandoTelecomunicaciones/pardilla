import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

window.firebase = firebase;
export const emulatorMode = import.meta.env.VITE_USE_EMULATORS === 'true';
export const firebaseConfig = emulatorMode
  ? { apiKey: 'demo-key', projectId: 'demo-pardilla', authDomain: 'demo-pardilla.firebaseapp.com' }
  : import.meta.env.VITE_FIREBASE_PROJECT_ID
    ? { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN }
    : null;
export function connectEmulators(app) {
  if (!emulatorMode) return;
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) throw new Error('Los emuladores solo se permiten en localhost.');
  app.auth().useEmulator('http://127.0.0.1:9099');
  app.firestore().useEmulator('127.0.0.1', 8080);
}
