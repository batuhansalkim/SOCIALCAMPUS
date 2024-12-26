import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGCqIMp2W_MSEXSNwS6fBXCOTcf3SVnQ8",
    authDomain: "campusapp-5a7ee.firebaseapp.com",
    projectId: "campusapp-5a7ee",
    storageBucket: "campusapp-5a7ee.firebasestorage.app",
    messagingSenderId: "881456151340",
    appId: "1:881456151340:web:96bcb3de17f644bb150a89",
    measurementId: "G-QDFNQW62PB"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIRESTORE_DB = getFirestore(FIREBASE_APP);
const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
const analytics = getAnalytics(FIREBASE_APP);

export { FIREBASE_APP, FIRESTORE_DB, FIREBASE_STORAGE };    
