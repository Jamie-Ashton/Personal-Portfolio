const message = document.getElementById('message');
message.addEventListener('focus', function() {
    this.setSelectionRange(5, 5); // Move the cursor to the 5th character position
});


const submitButton = document.getElementById('submit-button');
submitButton.onclick = function() {
console.log('Submit button clicked');
}