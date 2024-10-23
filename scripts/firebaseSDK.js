import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { GoogleAuthProvider, getAuth, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaPJ1NS3zYXnEsAbPpH6PqHBR5oOUbIdA",
  authDomain: "personal-portfolio-85009.firebaseapp.com",
  databaseURL: "https://personal-portfolio-85009-default-rtdb.firebaseio.com",
  projectId: "personal-portfolio-85009",
  storageBucket: "personal-portfolio-85009.appspot.com",
  messagingSenderId: "826713326618",
  appId: "1:826713326618:web:7a19401dff54da23ab7da3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);


console.log('Firebase SDK loaded');