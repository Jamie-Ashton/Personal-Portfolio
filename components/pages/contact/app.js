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
    const chat = document.getElementById('chat-container');
    chat.innerHTML = '';
}

// SECTION: Creating chat 
function setupChatElements(result) {
    const chatContainerDiv = document.getElementById('chat-container');

    // Create the header div
    const headerDiv = document.createElement('div');
    headerDiv.id = 'chat-header';
    chatContainerDiv.appendChild(headerDiv);

    // Create drop down if user is 'admin'
    if (result.user.uid === 'yfu9ldpAkpQwqKlDkzXdsgHJDo32') {
        console.log('Admin user');
        loadContacts();

        // Create a dropdown menu of contacts
        const contactList = document.createElement('select');
        contactList.id = 'contactList';
        headerDiv.appendChild(contactList); // Append dropdown menu to the header

        // Load chat messages for selected contact
        contactList.addEventListener('change', (e) => {
            const selectedUid = e.target.value;
            console.log('Selected UID:', selectedUid);
            loadChatMessages(chatDiv, selectedUid);
        });
    } else {
        // Append the displayName to the header for non-admin users
        const displayName = document.createElement('h3');
        displayName.id = 'displayName';
        displayName.textContent = result.user.displayName;
        headerDiv.appendChild(displayName); // Append the display name to the header
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
    headerDiv.appendChild(signOutBtn); // Append Sign Out Button to the header

    // Create Chat Div
    const chatDiv = document.getElementById('chat') || document.createElement('div');
    chatDiv.id = 'chat';
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

// SECTION: input messages listener
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


// SECTION: saving messages
function saveChatMessage(message, result) {
    const database = getDatabase(app);
    const chatRef = ref(database, 'chat');
    const newChatRef = push(chatRef);
    const currentDate = new Date().toLocaleString();
    
    // Check if the user is admin
    if(result.user.uid === 'yfu9ldpAkpQwqKlDkzXdsgHJDo32'){
        // Get the selected value from the dropdown
        const selectedEmail = document.getElementById('contactList').value;
        set(newChatRef, {
            message: message,
            user: result.user.displayName,
            date: currentDate,
            uid: result.user.uid,
            select: selectedEmail 
        });
    } else {
        set(newChatRef, {
            message: message,
            user: result.user.displayName,
            date: currentDate,
            uid: result.user.uid,
            email: result.user.email
        });
    }
}



// SECTION: Load chat messages
function loadChatMessages(chatDiv, userId) {
    const database = getDatabase(app);
    const chatRef = ref(database, 'chat');
    const adminUID = 'yfu9ldpAkpQwqKlDkzXdsgHJDo32';  // Admin UID

    onValue(chatRef, (snapshot) => {
        chatDiv.innerHTML = '';  // Clear current chat display

        snapshot.forEach((childSnapshot) => {
            const chatItem = childSnapshot.val();
            
            // Check if the message is from the user or to the user from the admin
            const isUserMessage = chatItem.uid === userId;
            const isAdminMessage = chatItem.select === userId;

            if (isUserMessage || isAdminMessage) {
                const messageWrapper = document.createElement('div');
                messageWrapper.classList.add('message-wrapper');

                // User element
                const userElement = document.createElement('span');
                userElement.textContent = chatItem.user;
                userElement.classList.add('message-user');
                
                // Message text element
                const messageText = document.createElement('p');
                messageText.innerHTML = `${chatItem.message}`;
                messageText.classList.add('message-text');
                
                // Date element
                const messageDate = document.createElement('span');
                messageDate.textContent = chatItem.date;
                messageDate.id = 'message-date';

                // Set different classes based on who wrote the message
                if (chatItem.uid === userId) {
                    userElement.id = 'user-user';
                    messageWrapper.id = 'user-wrapper';  // ID for the user wrapper
                } else if (chatItem.uid === adminUID) {
                    userElement.id = 'admin-user';
                    messageWrapper.id = 'admin-wrapper';  // ID for the admin wrapper
                }

                // Append elements to the wrapper
                messageWrapper.appendChild(userElement);
                messageWrapper.appendChild(messageText);
                messageWrapper.appendChild(messageDate);

                // Append the wrapper to the chatDiv
                chatDiv.appendChild(messageWrapper);
            }
        });
    });
}
// SECTION: Load contacts
function loadContacts() {
    const database = getDatabase(app);  // Initialize the database
    const chatRef = ref(database, 'chat');  // Reference the 'chat' path

    onValue(chatRef, (snapshot) => {
        const uniqueUsers = new Map(); // Use a Map to store unique users by their UID
        
        snapshot.forEach((childSnapshot) => {
            const chatItem = childSnapshot.val();
            if (!uniqueUsers.has(chatItem.uid)) {
                uniqueUsers.set(chatItem.uid, chatItem.email); // Add user email to Map only if not already added
            }
        });

        // Log the unique UIDs and users
        console.log('Unique Users:', Array.from(uniqueUsers.entries())); // Convert Map to array and log entries
        
        // Clear existing options
        const contactList = document.getElementById('contactList');
        contactList.innerHTML = '';

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