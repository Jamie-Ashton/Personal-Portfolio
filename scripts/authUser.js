import { app } from "./firebaseSDK.js";
import { GoogleAuthProvider, getAuth, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";




const provider = new GoogleAuthProvider();