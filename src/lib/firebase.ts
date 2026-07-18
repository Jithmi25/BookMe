import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_DEV,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_DEV,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
