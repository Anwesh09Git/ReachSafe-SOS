// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- Make sure this line is exactly here

// Keep YOUR exact configuration keys inside this block:
const firebaseConfig = {
  apiKey: "AIzaSyB3yALeZGoDezrcPIvpBUOxcJFlFoogZWM",
  authDomain: "reachsafe-1376f.firebaseapp.com",
  projectId: "reachsafe-1376f",
  storageBucket: "reachsafe-1376f.firebasestorage.app",
  messagingSenderId: "445284813023",
  appId: "1:445284813023:web:2281e22074e25fcabac16a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL LINE: This must have 'export', 'const', and lowercase 'auth'
export const auth = getAuth(app);