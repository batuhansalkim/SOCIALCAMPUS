import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBrvCS3PWGNxn1oZLaVvW43K082_oO5bM",
    authDomain: "socailcampus-f9720.firebaseapp.com",
    projectId: "socailcampus-f9720",
    storageBucket: "socailcampus-f9720.firebasestorage.app",
    messagingSenderId: "192303260110",
    appId: "1:192303260110:web:d4aafc093a3726137e8b9f",
    measurementId: "G-Z5PML2M962"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(app);
export const FIRESTORE_DB = getFirestore(app);
export const FIREBASE_STORAGE = getStorage(app);

// Offline persistence'ı aktifleştir
enableIndexedDbPersistence(FIRESTORE_DB)
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Offline persistence çoklu sekmede çalışamaz');
        } else if (err.code == 'unimplemented') {
            console.warn('Tarayıcı offline persistence desteklemiyor');
        }
    });

export default app;    