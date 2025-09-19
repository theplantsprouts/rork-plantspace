import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDzPmgJia4ZKtbuKM6wiSPPK27023HRqFs",
  authDomain: "plantspace-5a93d.firebaseapp.com",
  projectId: "plantspace-5a93d",
  storageBucket: "plantspace-5a93d.firebasestorage.app",
  messagingSenderId: "969912616990",
  appId: "1:969912616990:web:7c9bccb8ca7d7996bbc60f",
  measurementId: "G-W39QPM2BQK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;