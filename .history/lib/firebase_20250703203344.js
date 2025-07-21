// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA_v304o9udDkHk6k9391dRmQ3A9uLyJR8",
  authDomain: "bioingepro-74512.firebaseapp.com",
  databaseURL: "https://bioingepro-74512-default-rtdb.firebaseio.com",
  projectId: "bioingepro-74512",
  storageBucket: "bioingepro-74512.appspot.com",
  messagingSenderId: "1000543308840",
  appId: "1:1000543308840:web:16f497906ea59f0f76791d",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
