// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ Firestore

const firebaseConfig = {
  apiKey: "AIzaSyA2NhnfEBr0Tg4GAp9Txj7KExGok5GPNVw",
  authDomain: "perumar2-36331.firebaseapp.com",
  projectId: "perumar2-36331",
  storageBucket: "perumar2-36331.appspot.com",
  messagingSenderId: "951260677160",
  appId: "1:951260677160:web:1c39ad75605a923733e11d",
  measurementId: "G-D9S5NT8QRK",
};

const app = initializeApp(firebaseConfig);

// ⚠️ ATENCIÓN: ESTA exportación debe ser usada en `/api/auth/login`
export const firestore = getFirestore(app);
