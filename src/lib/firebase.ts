
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVrQbRTSX55GsWNJT7vStJt7krrmgK438",
  authDomain: "web-record-c4806.firebaseapp.com",
  databaseURL: "https://web-record-c4806-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-record-c4806",
  storageBucket: "web-record-c4806.firebasestorage.app",
  messagingSenderId: "285508349264",
  appId: "1:285508349264:web:17080d3838ec4d8ec9d055",
  measurementId: "G-XQ197HP36M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
