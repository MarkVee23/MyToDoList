import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseConfig } from './types';

// Default project settings for my-to-do-list-537e1
const DEFAULT_PROJECT_ID = 'my-to-do-list-537e1';
const STORAGE_KEY = 'my_todo_firebase_config';

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored firebase config:', e);
  }

  // Fallback to environment variables
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envApiKey && envApiKey.trim() !== '') {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${DEFAULT_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${DEFAULT_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const currentConfig = getStoredFirebaseConfig();

if (currentConfig && currentConfig.apiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(currentConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export const isFirebaseConfigured = (): boolean => {
  return !!(auth && db && currentConfig?.apiKey);
};

export { app, auth, db, googleProvider, currentConfig };
