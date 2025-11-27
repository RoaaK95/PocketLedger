import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0lLAxQbZqObz7r4tRjjbtZR48nz32N_o",
  authDomain: "pocketledger-ded5c.firebaseapp.com",
  projectId: "pocketledger-ded5c",
  storageBucket: "pocketledger-ded5c.appspot.com",
  messagingSenderId: "692400109692",
  appId: "1:692400109692:web:d1e9cc2414e45b112331f9",
  measurementId: "G-TY4METMXLX"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize auth with persistence only once
let auth: Auth;
try {
  // @ts-ignore - getReactNativePersistence is available at runtime
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error: any) {
  // Auth already initialized, get existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);