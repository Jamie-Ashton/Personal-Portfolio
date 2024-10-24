import { app } from "../../../scripts/firebaseSDK.js";
import { GoogleAuthProvider, getAuth, createUserWithEmailAndPassword, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Ensure signOut is imported
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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
            console.log('clicked inside');

            // Sign in with popup
            signInWithPopup(getAuth(app), provider).then((result) => {
                // Handle sign in result
                console.log('User signed in:', result.user);

                // Hide the modal after successful sign-in
                modal.style.display = 'none';

                // Create and append the sign-out button
                const signOutBtn = document.createElement('button');
                signOutBtn.id = 'signOutBtn';
                signOutBtn.textContent = 'Sign Out';
                const chatContainerDiv = document.getElementById('chat-container'); 
                chatContainerDiv.appendChild(signOutBtn);

                signOutBtn.onclick = function() {
                    // Sign out the user
                    signOut(getAuth(app)).then(() => {
                        console.log('User signed out');
                        // Remove the button after sign out
                        signOutBtn.remove();
                    }).catch((error) => {
                        console.error('Error signing out:', error);
                    });
                };
                // Appending input box to #chat
                const chatDiv = document.getElementById('chat'); 
                const chatInput = document.createElement('input');
                chatInput.id = 'chat-input';
                chatInput.placeholder = 'Type your message here';
                chatInput.type = 'text';
                chatDiv.appendChild(chatInput);

                // Create and append the input button
                const chatInputBtn = document.createElement('button');
                chatInputBtn.id = 'chat-input-btn';
                chatInputBtn.textContent = 'Send';
                chatDiv.appendChild(chatInputBtn);

                // push chat-input to firebase
                chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                const message = chatInput.value.trim();
                console.log('Enter key pressed');
                console.log('message', message);
                chatInput.value = '';

                // push chat-input to firebase
                if(message.length > 0) {	
                    const database = getDatabase(app);
                    const chatRef = ref(database, 'chat');
                    const newChatRef = push(chatRef);
                    const currentDate = new Date().toLocaleString();
                    set(newChatRef, {
                        message: message,
                        user: result.user.displayName,
                        date: currentDate,
                        uid: result.user.uid
                    });
             }
            
            //  Fetch and render chat messages from firebase
            const database = getDatabase(app);
            const chatRef = ref(database, 'chat');
            console.log(chatRef);

            onValue(chatRef, (snapshot) => {
                // Clear current chat display
                chatDiv.innerHTML = '';
                snapshot.forEach((childSnapshot) => {
                    const chatItem = childSnapshot.val();
                    if (chatItem.uid === result.user.uid) {  // Filter by user UID
                        const p = document.createElement('p');
                        p.textContent = `${chatItem.user}: ${chatItem.message}`;
                        chatDiv.appendChild(p);
                    }
                });
            });
    }
});

            }).catch((error) => {
                // Handle errors
                console.error('Error signing in:', error);
            });
        }
    };
});


// Validation???




