// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaPJ1NS3zYXnEsAbPpH6PqHBR5oOUbIdA",
  authDomain: "personal-portfolio-85009.firebaseapp.com",
  databaseURL: "https://personal-portfolio-85009-default-rtdb.firebaseio.com",
  projectId: "personal-portfolio-85009",
  storageBucket: "personal-portfolio-85009.firebasestorage.app",
  messagingSenderId: "826713326618",
  appId: "1:826713326618:web:7a19401dff54da23ab7da3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export { app };
console.log('Firebase SDK loaded');






