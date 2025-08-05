import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBrvCS3PWGNxn1oZLaVvW43K082_oO5bM",
  authDomain: "socailcampus-f9720.firebaseapp.com",
  projectId: "socailcampus-f9720",
  storageBucket: "socailcampus-f9720.firebasestorage.app",
  messagingSenderId: "192303260110",
  appId: "1:192303260110:web:d4aafc093a3726137e8b9f",
  measurementId: "G-Z5PML2M962"
};

const app = initializeApp(firebaseConfig);

export const FIRESTORE_DB = getFirestore(app);

export default app;