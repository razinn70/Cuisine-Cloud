// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDk1v5Xyp3gzulxqR5aBcOZehm4r-LGIUo",
  authDomain: "cuisine-cloud-wfemi.firebaseapp.com",
  projectId: "cuisine-cloud-wfemi",
  storageBucket: "cuisine-cloud-wfemi.firebasestorage.app",
  messagingSenderId: "65923384921",
  appId: "1:65923384921:web:3b56799493d5743ff11348"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
