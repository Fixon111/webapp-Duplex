// firebase/firebaseConfig.ts
import { getStorage } from "@firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config (use your actual values from Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBZeEqHov1hnlylo4AR9OC8r8G89iG9DQ8",
  authDomain: "ghanarentals-211fb.firebaseapp.com",
  projectId: "ghanarentals-211fb",
  storageBucket: "ghanarentals-211fb.appspot.com",
  messagingSenderId: "109441201332",
  appId: "1:109441201332:web:eb0258fd7ea804f43653e1",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
