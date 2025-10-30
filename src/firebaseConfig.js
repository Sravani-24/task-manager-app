// src/firebaseConfig.js

// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA2y-c3rHSTmCzsrSNA0aUprGfXRHYMcOo",
  authDomain: "task-manager-4dc7a.firebaseapp.com",
  projectId: "task-manager-4dc7a",
  storageBucket: "task-manager-4dc7a.firebasestorage.app",
  messagingSenderId: "861380212377",
  appId: "1:861380212377:web:0757fb28bfda61058d2a08",
  measurementId: "G-70SNMMS6ZX"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export services for use in app
export const auth = getAuth(app);
export const db = getFirestore(app);
