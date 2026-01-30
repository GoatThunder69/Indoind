import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyArGvUOJ041eNNW6PDvLEDLZhSh4LE4HUk",
  authDomain: "cmfs-de001.firebaseapp.com",
  databaseURL: "https://cmfs-de001-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cmfs-de001",
  storageBucket: "cmfs-de001.firebasestorage.app",
  messagingSenderId: "903302114644",
  appId: "1:903302114644:web:5b873d68a55a497230acc1",
  measurementId: "G-8RL93P4J4C"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
