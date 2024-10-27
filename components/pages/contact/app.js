import { app } from "../../../scripts/firebaseSDK.js";
import { GoogleAuthProvider, getAuth, createUserWithEmailAndPassword, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const database = getDatabase(app);

function showModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'block';
}

function hideModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}

function signInUser() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(getAuth(app), provider);
}

function signOutUser() {
    return signOut(getAuth(app)).then(() => {
        reset(); // Clear the page
        showModal();
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

function reset() {
    const chatDiv = document.getElementById('chat');
    const chatInput = document.getElementById('chat-input');
    const chatInputBtn = document.getElementById('chat-input-btn');
    const contactList = document.getElementById('contactList');
    contactList.style.display = 'none';
    chatInputBtn.style.display = 'none';
    chatInput.style.display = 'none';
    chatDiv.innerHTML = '';
}



// SECTION: Creating chat elements
function setupChatElements(result) {
    const chatContainerDiv = document.getElementById('chat-container');
    
    // Create drop down if user is 'admin'
    if (result.user.uid === 'yfu9ldpAkpQwqKlDkzXdsgHJDo32') {
        // Test 
        console.log('Admin user');
        loadContacts();

        // Create a dropdown menu of contacts
        const contactList = document.createElement('select');
        contactList.id = 'contactList';
        chatContainerDiv.appendChild(contactList);

        // Load chat messages for selected contact
        contactList.addEventListener('change', (e) => {
            const selectedUid = e.target.value;
            console.log('Selected UID:', selectedUid);
            loadChatMessages(chatDiv, selectedUid);
        });	
    }

    // Create Sign Out Button
    const signOutBtn = document.createElement('button');
    signOutBtn.id = 'signOutBtn';
    signOutBtn.textContent = 'Sign Out';
    signOutBtn.onclick = function () {
        signOutUser().then(() => {
            console.log('User signed out');
            signOutBtn.remove();
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    };
    chatContainerDiv.appendChild(signOutBtn);


    const chatDiv = document.getElementById('chat');
    // chatDiv.id = 'chat';
    chatContainerDiv.appendChild(chatDiv);

    // Create Chat Input
    const chatInput = document.createElement('input');
    chatInput.id = 'chat-input';
    chatInput.placeholder = 'Type your message here';
    chatInput.type = 'text';
    chatContainerDiv.appendChild(chatInput);
    
    // Create Send Button
    const chatInputBtn = document.createElement('button');
    chatInputBtn.id = 'chat-input-btn';
    chatInputBtn.textContent = 'Send';
    chatContainerDiv.appendChild(chatInputBtn);

    loadChatMessages(chatDiv, result.user.uid);
    setupChatInputListener(chatInput, result);
}




// SECTION: "Enter key Listener"
function setupChatInputListener(chatInput, result) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = chatInput.value.trim();
            console.log('Enter key pressed');
            console.log('message', message);
            chatInput.value = '';
            if (message.length > 0) {
                saveChatMessage(message, result);
            }
        }
    });
}


// SECTION: save chat messages
function saveChatMessage(message, result) {
    const database = getDatabase(app);
    const chatRef = ref(database, 'chat');
    const newChatRef = push(chatRef);
    const currentDate = new Date().toLocaleString();
    set(newChatRef, {
        message: message,
        user: result.user.displayName,
        date: currentDate,
        uid: result.user.uid,
        email: result.user.email
    });
}

// SECTION: Load chat messages
function loadChatMessages(chatDiv, userId) {
    const database = getDatabase(app);
    const chatRef = ref(database, 'chat');
    
    onValue(chatRef, (snapshot) => {
        chatDiv.innerHTML = '';  // Clear current chat display
        
        snapshot.forEach((childSnapshot) => {
            const chatItem = childSnapshot.val();
            if (chatItem.uid === userId) {  // Filter by user UID
                const p = document.createElement('p');
                p.textContent = `${chatItem.user}: ${chatItem.message}`;
                chatDiv.appendChild(p);
            }
        });
    });
}



function loadContacts() {
    const database = getDatabase(app);  // Initialize the database
    const chatRef = ref(database, 'chat');  // Reference the 'chat' path

    onValue(chatRef, (snapshot) => {
        const uniqueUsers = new Map(); // Use a Map to store unique users by their UID
        
        snapshot.forEach((childSnapshot) => {
            const chatItem = childSnapshot.val();
            uniqueUsers.set(chatItem.uid, chatItem.email); // Add user email to Map
        });

        // Log the unique UIDs and users
        console.log('Unique Users:', Array.from(uniqueUsers.entries())); // Convert Map to array and log entries

        // Append emails to contact list
        uniqueUsers.forEach((email, uid) => {
            const option = document.createElement('option');
            option.value = uid;
            option.textContent = email;
            contactList.appendChild(option);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    showModal();

    window.onclick = function (e) {
        const modalContent = document.querySelector('.modal-content');
        if (e.target !== modalContent && !modalContent.contains(e.target)) {
            hideModal();
        } else if (e.target === modalContent || modalContent.contains(e.target)) {
            signInUser().then((result) => {
                console.log('User signed in:', result.user);
                hideModal();
                setupChatElements(result);
            }).catch((error) => {
                console.error('Error signing in:', error);
            });
        }
    };
});