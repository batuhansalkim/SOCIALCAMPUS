import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; //veri tabanı için kullanılabilir.

const firebaseConfig = {
    apiKey: "AIzaSyBGCqIMp2W_MSEXSNwS6fBXCOTcf3SVnQ8",
    authDomain: "campusapp-5a7ee.firebaseapp.com",
    projectId: "campusapp-5a7ee",
    storageBucket: "campusapp-5a7ee.firebasestorage.app",
    messagingSenderId: "881456151340",
    appId: "1:881456151340:web:96bcb3de17f644bb150a89",
    measurementId: "G-QDFNQW62PB"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(firebaseApp);
export const FIRESTORE_DB = getFirestore(firebaseApp); //veri tabanı bağlantısı için kullanılabilir    
