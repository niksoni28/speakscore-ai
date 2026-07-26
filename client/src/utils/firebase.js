// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-fcb6a.firebaseapp.com",
  projectId: "interviewiq-fcb6a",
  storageBucket: "interviewiq-fcb6a.firebasestorage.app",
  messagingSenderId: "123389925865",
  appId: "1:123389925865:web:325bd21ea5713e7a915378"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider()
export {auth, provider  }