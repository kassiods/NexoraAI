import { initializeApp, getApps } from 'firebase/app';
import { getAuth as fbGetAuth } from 'firebase/auth';
import { getFirestore as fbGetFirestore } from 'firebase/firestore';
import { getStorage as fbGetStorage } from 'firebase/storage';

// Placeholder config. When integrating Firebase, preencha as variáveis de ambiente
// e reative o uso real. No modo mock, esse arquivo não é utilizado.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const getFirebaseApp = () => {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

export const getAuth = () => fbGetAuth(getFirebaseApp());
export const getDb = () => fbGetFirestore(getFirebaseApp());
export const getStorage = () => fbGetStorage(getFirebaseApp());
