document.addEventListener('DOMContentLoaded', () => {
    const contactLink = document.getElementById("contact");
    if (contactLink) {
        contactLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default action
            console.log('Contact Me link clicked');
            alert('Contact Me link clicked'); // Add a pop-up box
            // You can add your custom logic here
        });
    } else {
        console.error('Contact link not found');
    }
});