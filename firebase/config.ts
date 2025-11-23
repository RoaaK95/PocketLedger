import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0lLAxQbZqObz7r4tRjjbtZR48nz32N_o",
  authDomain: "pocketledger-ded5c.firebaseapp.com",
  projectId: "pocketledger-ded5c",
  storageBucket: "pocketledger-ded5c.firebasestorage.app",
  messagingSenderId: "692400109692",
  appId: "1:692400109692:web:d1e9cc2414e45b112331f9",
  measurementId: "G-TY4METMXLX"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);