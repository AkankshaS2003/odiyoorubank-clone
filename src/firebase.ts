import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzsLv3_ySJYgxo491l-VBYClE-Y9_HJsg",
  authDomain: "project-b72a0ea6-c41d-4cee-8e3.firebaseapp.com",
  projectId: "project-b72a0ea6-c41d-4cee-8e3",
  storageBucket: "project-b72a0ea6-c41d-4cee-8e3.firebasestorage.app",
  messagingSenderId: "526865912955",
  appId: "1:526865912955:web:f390a227a95de516a6fede",
  measurementId: "G-PNYLQGJ0L6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
