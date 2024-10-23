import { app } from "../../../scripts/firebaseSDK.js";
import { GoogleAuthProvider, getAuth, createUserWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    // Show the modal when the page loads
    var modal = document.getElementById('myModal');
    var modalContent = document.querySelector('.modal-content');
    modal.style.display = 'block';

    // Define the GoogleAuthProvider
    const provider = new GoogleAuthProvider();

    // Close the modal when the user clicks anywhere outside of the modal content
    window.onclick = function(e) {
        if (e.target !== modalContent && !modalContent.contains(e.target)) {
            modal.style.display = 'none';
        } else if (e.target === modalContent || modalContent.contains(e.target)) {
            // eventlistener test...
            console.log('clicked inside');
            signInWithPopup(getAuth(app), provider).then((result) => {
                // Handle sign in result
                console.log('User signed in:', result.user);
                // Hides the modal when user signed in...
                modal.style.display = 'none';
            }).catch((error) => {
                // Handle errors
                console.error('Error signing in:', error);
            });
        }
    };
});
//Once signed in, set modal to hidden and display chat


//Sign out button 


//Pull chat from database as per user that has logged in


// Validation???




