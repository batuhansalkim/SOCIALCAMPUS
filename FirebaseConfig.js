import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; //veri tabanı için kullanılabilir.
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBGCqIMp2W_MSEXSNwS6fBXCOTcf3SVnQ8",
    authDomain: "campusapp-5a7ee.firebaseapp.com",
    projectId: "campusapp-5a7ee",
    storageBucket: "campusapp-5a7ee.firebasestorage.app",
    messagingSenderId: "881456151340",
    appId: "1:881456151340:web:96bcb3de17f644bb150a89",
    measurementId: "G-QDFNQW62PB"
};

const app = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(app);
export const storage = getStorage(app);
export const FIREBASE_AUTH = getAuth(app);

export default app;    
