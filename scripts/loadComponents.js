// Function to load a component from a given path
function loadComponent(elementId, filePath) {
    // Fetch the HTML content from the provided file path
    fetch(filePath)
        .then(response => {
            // Check if the response is okay (status code 200)
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            return response.text(); // Convert the response to text (HTML content)
        })
        .then(data => {
            // Insert the fetched HTML content into the specified element
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error)); // Log any errors to the console
}

// Load the components when the window has finished loading
window.onload = function () {
    loadComponent('header', 'components/header/header.html'); // Load the header component into the div with ID 'header'
    loadComponent('footer', 'components/footer/footer.html'); // Load the footer component into the div with ID 'footer'
};

