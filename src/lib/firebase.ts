import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCxe9tE_5WIZzgtyAURB1dIvlqEEMKrjks",
  authDomain: "test-214db.firebaseapp.com",
  databaseURL: "https://test-214db-default-rtdb.firebaseio.com",
  projectId: "test-214db",
  storageBucket: "test-214db.firebasestorage.app",
  messagingSenderId: "199728621136",
  appId: "1:199728621136:web:d311551fd8d1333879d355",
  measurementId: "G-KCP4D7EQL8"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
