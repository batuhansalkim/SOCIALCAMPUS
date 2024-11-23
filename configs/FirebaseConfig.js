// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);