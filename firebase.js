// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_mzDpMmzrmjVBDqEtIIDR2yTvEHHECtU",
  authDomain: "inventory-management-45575.firebaseapp.com",
  projectId: "inventory-management-45575",
  storageBucket: "inventory-management-45575.appspot.com",
  messagingSenderId: "346845010872",
  appId: "1:346845010872:web:e072a969e31d2a99158d4d",
  measurementId: "G-T3HEERJ8PS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export {firestore, storage};