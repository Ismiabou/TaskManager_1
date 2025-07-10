// config/firebaseConfig.web.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging'; // Web messaging specific

const firebaseConfig = {
  apiKey: "AIzaSyAgrDLtfWScV8768cLFXf-0gbxL72X7_bA",
  authDomain: "myreactnativetaskmanager.firebaseapp.com",
  projectId: "myreactnativetaskmanager",
  storageBucket: "myreactnativetaskmanager.appspot.com",
  messagingSenderId: "625678456183",
  appId: "1:625678456183:web:9deaa5a99fec1c4524bd72",
  measurementId: "G-YNDV3JY80M"
};
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app); // Only initialized for web