import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgrDLtfWScV8768cLFXf-0gbxL72X7_bA",
  authDomain: "myreactnativetaskmanager.firebaseapp.com",
  projectId: "myreactnativetaskmanager",
  storageBucket: "myreactnativetaskmanager.appspot.com",
  messagingSenderId: "625678456183",
  appId: "1:625678456183:web:9deaa5a99fec1c4524bd72",
  measurementId: "G-YNDV3JY80M"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Correctly set up persistence using AsyncStorage
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app); // fallback in case of hot reload
}

const db = getFirestore(app);

export { auth, db };
