import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDv46juEYo7lveN8V9X8Q1dyPM_HfHQ3n8",
  authDomain: "closet-connect---csci-362.firebaseapp.com",
  projectId: "closet-connect---csci-362",
  storageBucket: "closet-connect---csci-362.appspot.com",
  messagingSenderId: "1011590254857",
  appId: "1:1011590254857:ios:52ed9f4cd45f308fa2c3d8"
};

const app = initializeApp(firebaseConfig);
export { app };                 // <-- add this line
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
