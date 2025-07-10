// config/firebaseConfig.native.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// No getMessaging here if you're not using native Firebase Cloud Messaging
import AsyncStorage from '@react-native-async-storage/async-storage'; // Native specific import

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
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = undefined; // Or initialize native messaging if you need it