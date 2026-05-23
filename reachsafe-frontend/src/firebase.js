import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB3yALeZGoDezrcPIvpBUOxcJFlFoogZWM",
  authDomain: "reachsafe-1376f.firebaseapp.com",
  projectId: "reachsafe-1376f",
  storageBucket: "reachsafe-1376f.firebasestorage.app",
  messagingSenderId: "445284813023",
  appId: "1:445284813023:web:2281e22074e25fcabac16a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
