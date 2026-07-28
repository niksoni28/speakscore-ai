import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-fcb6a.firebaseapp.com",
  projectId: "interviewiq-fcb6a",
  storageBucket: "interviewiq-fcb6a.firebasestorage.app",
  messagingSenderId: "123389925865",
  appId: "1:123389925865:web:325bd21ea5713e7a915378"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider()
export {auth, provider  }