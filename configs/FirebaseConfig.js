import { initializeApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDLKRTo0Eg760LmRSvkE3kVEyYbgKgSmEY",
  authDomain: "socialcampus-app.firebaseapp.com",
  projectId: "socialcampus-app",
  storageBucket: "socialcampus-app.firebasestorage.app",
  messagingSenderId: "186488986629",
  appId: "1:186488986629:web:ed9f6e3370c39a60ad906c"
};

const app = initializeApp(firebaseConfig);

// Firestore'u offline-first modda başlat
export const FIRESTORE_DB = getFirestore(app);

// Firebase online mode - production ready
console.log('Firestore online mode enabled');

export const AUTH = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const STORAGE = getStorage(app);

// Analytics'i React Native için devre dışı bırak
export const ANALYTICS = null;

export default app;