import { app } from "../../../scripts/firebaseSDK.js";
import { GoogleAuthProvider, getAuth, createUserWithEmailAndPassword, signInWithPopup, signOut } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, update, remove } from 
"https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const database = getDatabase(app);


// Initialize the global variable to store the current user
let currentUser = null;

function showModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'block';
}

function hideModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}

// SECTION: Sign in user and create current user object
function signInUser() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(getAuth(app), provider)
        .then((result) => {
            // Log the user object
            console.log('User signed in:', result.user);

            // Assign the user object to the global variable
            currentUser = result.user;

            // Return the result for further chaining if needed
            return result;
        })
        .catch((error) => {
            console.error('Error signing in:', error);
        });
}

// SECTION: Sign out user
function signOutUser() {
    return signOut(getAuth(app)).then(() => {
        reset(); // Clear the page
        showModal();
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// SECTION: Reset the page
function reset() {
    const chat = document.getElementById('chat-container');
    chat.innerHTML = '';
    // This will refresh the page
    location.reload();
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

    // Sanitize input
    const sanitizedMessage = sanitize(message);
    const sanitizedDisplayName = sanitize(result.user.displayName);
    const sanitizedUid = sanitize(result.user.uid);
    const sanitizedEmail = sanitize(result.user.email);

    // Check if the user is admin
    if (sanitizedUid === 'yfu9ldpAkpQwqKlDkzXdsgHJDo32') {
        // Get the selected value from the dropdown and display the messages from them
        const selectedEmail = document.getElementById('contactList').value;
        const sanitizedSelectedEmail = sanitize(selectedEmail);
        // Admin account saved message
        set(newChatRef, {
            message: sanitizedMessage,
            user: sanitizedDisplayName,
            date: currentDate,
            uid: sanitizedUid,
            select: sanitizedSelectedEmail 
        });
        // User account saved message
    } else {
        set(newChatRef, {
            message: sanitizedMessage,
            user: sanitizedDisplayName,
            date: currentDate,
            uid: sanitizedUid,
            email: sanitizedEmail
        });
    }
}

// SECTION: Sanitize input
function sanitize(input) {
    return input.replace(/[&<>"'/;(){}[\]\\`@$%!]/g, function (match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            ';': '&#59;',
            '(': '&#40;',
            ')': '&#41;',
            '{': '&#123;',
            '}': '&#125;',
            '[': '&#91;',
            ']': '&#93;',
            '\\': '&#92;',
            '`': '&#96;',
            '@': '&#64;',
            '$': '&#36;',
            '%': '&#37;',
            '!': '&#33;'
        };
        return escape[match];
    });
}

// SECTION: Decode sanitized input


// SECTION: Load chat messages
function loadChatMessages(chatDiv, userId) {
    const database = getDatabase(app); // Firestore reference
    const chatRef = ref(database, 'chat'); // Real time database collection
    const adminUID = 'yfu9ldpAkpQwqKlDkzXdsgHJDo32';  // Admin UID

    // Listen for changes to the chat collection
    onValue(chatRef, (snapshot) => {
        chatDiv.innerHTML = '';  // Clear current chat display

        snapshot.forEach((childSnapshot) => {

            const chatItem = childSnapshot.val();
            
            // Check if the message object is from the current user or admin
            const isUserMessage = chatItem.uid === userId;
            const isAdminMessage = chatItem.select === userId;

            // Create Div to hold message
            if (isUserMessage || isAdminMessage) {
                const messageWrapper = document.createElement('div');
                messageWrapper.classList.add('message-wrapper');

                // Add user name 
                const userElement = document.createElement('span');
                userElement.textContent = chatItem.user;
                userElement.classList.add('message-user');
                
                // Add message text 
                const messageText = document.createElement('p');
                messageText.innerHTML = `${chatItem.message}`;
                messageText.classList.add('message-text');
                
                // Add date to message
                const messageDate = document.createElement('span');
                messageDate.textContent = chatItem.date;
                messageDate.id = 'message-date';

                // Add edit icon to message
                const editIcon = document.createElement('span');
                editIcon.classList.add('material-symbols-outlined', 'edit-button');
                editIcon.textContent = 'edit';

                // Set different id for user and admin
                if (chatItem.uid === userId) {
                    userElement.id = 'user-user';
                    messageWrapper.id = 'user-wrapper';  
                } else if (chatItem.uid === adminUID) {
                    userElement.id = 'admin-user';
                    messageWrapper.id = 'admin-wrapper';  
                }
                
                // Listen for click event on edit icon
                editIcon.addEventListener('click', () => editMessage(chatItem, childSnapshot.ref));

                // Append elements to the wrapper
                messageWrapper.appendChild(userElement);
                messageWrapper.appendChild(messageText);
                messageWrapper.appendChild(messageDate);
                // Append edit icon only if the current user is the author of the message
                if (currentUser.uid === chatItem.uid) {
                    messageWrapper.appendChild(editIcon);
                };
                console.log(currentUser.uid);

                // Append the wrapper to the chatDiv
                chatDiv.appendChild(messageWrapper);
            }
        });
    });
}

// SECTION: Load contacts
function decode(input) {
    const reverseEscape = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x2F;': '/',
        '&#59;': ';',
        '&#40;': '(',
        '&#41;': ')',
        '&#123;': '{',
        '&#125;': '}',
        '&#91;': '[',
        '&#93;': ']',
        '&#92;': '\\',
        '&#96;': '`',
        '&#64;': '@',
        '&#36;': '$',
        '&#37;': '%',
        '&#33;': '!'
    };
    
    return input.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|&#59;|&#40;|&#41;|&#123;|&#125;|&#91;|&#93;|&#92;|&#96;|&#64;|&#36;|&#37;|&#33;)/g, function (match) {
        return reverseEscape[match];
    });
}

function loadContacts() {
    const database = getDatabase(app);  // Initialize the database
    const chatRef = ref(database, 'chat');  // Reference the collection
    const adminUID = 'yfu9ldpAkpQwqKlDkzXdsgHJDo32'; // Define the admin UID

    onValue(chatRef, (snapshot) => {
        const uniqueUsers = new Map(); // Use a Map to store unique users by their UID

        snapshot.forEach((childSnapshot) => {
            const chatItem = childSnapshot.val();
            if (chatItem.uid !== adminUID && chatItem.email && !uniqueUsers.has(chatItem.uid)) {
                uniqueUsers.set(chatItem.uid, chatItem.email.trim()); // Add user email to Map only if not already added and trim it
            }
        });

        // Log the unique UIDs and users
        console.log('Unique Users:', Array.from(uniqueUsers.entries())); // Convert Map to array and log entries

        // Get the contactList element
        const contactList = document.getElementById('contactList');
        // Save the selected value
        const selectedValue = contactList.value;

        // Clear existing options and deselect
        contactList.innerHTML = '';
        contactList.selectedIndex = -1;  // Deselect any default selection

        // Append emails to contact list
        uniqueUsers.forEach((email, uid) => {
            if (email && email !== 'undefined') { // Ensure the email is not undefined or an empty string
                const option = document.createElement('option');
                option.value = uid;
                option.textContent = decode(email); // Decode the email before displaying
                contactList.appendChild(option);
            }
        });

        // Re-select the previously selected value, if it exists
        if (selectedValue && contactList.options.length > 0) {
            contactList.value = selectedValue;
        } else {
            contactList.selectedIndex = -1;  // Ensure no selection if nothing is saved
        }
    });
}




// SECTION: Edit messages
function editMessage(chatItem, chatItemRef) {
    console.log('Edit message:', chatItem.message);

    const messageWrapper = event.target.parentElement;
    const messageText = messageWrapper.querySelector('.message-text');
    const editIcon = messageWrapper.querySelector('.edit-button'); // Locate the edit icon

    // Remove the edit icon from the message wrapper
    if (editIcon) {
        messageWrapper.removeChild(editIcon);
    }

    const originalMessage = decode(chatItem.message);
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = originalMessage;
    inputField.classList.add('edit-input');

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-button');

    // Add editing class to wrapper
    messageWrapper.classList.add('editing');

    messageWrapper.replaceChild(inputField, messageText);
    messageWrapper.appendChild(saveButton);

    saveButton.addEventListener('click', () => {
        const updatedMessage = sanitize(inputField.value);
        const currentDate = new Date().toLocaleString();

        if (updatedMessage.length === 0) {
            // Delete the message if input is empty
            remove(chatItemRef).then(() => {
                console.log('Message deleted from the database');

                // Safely check if the parent element exists before removing the wrapper
                if (messageWrapper.parentElement) {
                    messageWrapper.parentElement.removeChild(messageWrapper);
                }
            }).catch((error) => {
                console.error('Error deleting message:', error);
            });
        } else {
            // Update the message in the database
            update(chatItemRef, {
                message: updatedMessage,
                date: currentDate
            }).then(() => {
                console.log('Message updated in the database');

                // Replace input field and save button with the updated message text
                messageText.textContent = updatedMessage;
                messageWrapper.replaceChild(messageText, inputField);
                messageWrapper.removeChild(saveButton);

                // Remove editing class from wrapper
                messageWrapper.classList.remove('editing');
            }).catch((error) => {
                console.error('Error updating message:', error);
            });
        }
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