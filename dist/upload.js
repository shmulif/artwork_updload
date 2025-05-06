import { createAnimal } from './api_requests.js';
checkForAuthToken();
function checkForAuthToken() {
    const authToken = localStorage.getItem('authToken');
    // If for some reson there's no auth token redirect to login page
    if (authToken === null) {
        window.location.href = 'index.html';
        return;
    }
}
window.submitUploadArtworkForm = async function (event) {
    event.preventDefault();
    clearError();
    const name = document.getElementById('name');
    const description = document.getElementById('description');
    const images = document.getElementById('fileInput');
    const file = images.files?.[0];
    if (!file) {
        displayError("Please select an image.");
        return;
    }
    const base64Image = await readFileAsBase64(file);
    if (name && description && images) {
        const [jsonString, message] = validateAndFormat(name.value, description.value, base64Image);
        const authToken = localStorage.getItem('authToken');
        if (jsonString === null) {
            displayError(message);
            return;
        }
        if (authToken === null) {
            alert('Unauthenticated. Please login again');
            window.location.href = 'index.html';
            return;
        }
        await handleSubmission(authToken, jsonString);
    }
    else {
        console.error('Input not found');
    }
};
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject("Error reading file.");
        reader.readAsDataURL(file);
    });
}
async function handleSubmission(authToken, jsonString) {
    try {
        // Call the login function and destructure the response and result
        const [status, message] = await createAnimal(authToken, jsonString);
        // Handle status codes
        if (status === 201) {
            // alert(message.success) // This was causing the next line not to work
            window.location.href = 'admin.html';
            return;
        }
        if (status === 401) {
            alert('Unauthorized. Credentials may have expired. Please login again');
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
            return;
        }
        if (status === 400 || status === 500) {
            // Assert that result is an object with an error message
            if (typeof message === 'object' && 'error' in message) {
                displayError(message.error);
            }
            else {
                console.error('Unexpected response format for error status.');
                console.log(message.body);
            }
        }
        else {
            console.error('Unexpected status code:', status);
        }
    }
    catch (error) {
        console.error('An error occurred during login:', error);
    }
}
function displayError(errorMessage) {
    const pageDisplay = document.getElementById("error-message");
    // Check if the element exists before attempting to update it
    if (pageDisplay) {
        pageDisplay.style.color = "red";
        pageDisplay.innerHTML = `${errorMessage}`;
    }
    else {
        console.error("Element with ID 'error-message' not found.");
    }
}
function clearError() {
    const pageDisplay = document.getElementById("error-message");
    // Check if the element exists before attempting to update it
    if (pageDisplay) {
        pageDisplay.innerHTML = '';
    }
    else {
        console.error("Element with ID 'error-message' not found.");
    }
}
function validateAndFormat(name, description, image) {
    if (!name) {
        return [null, 'Error: Missing name.'];
    }
    const descriptionArray = description.split('\n').filter((line) => line.trim() !== '');
    const newArtwork = {
        id: crypto.randomUUID(),
        name: name,
        description: descriptionArray,
        image: image,
        createdByUser: 'user',
    };
    return [JSON.stringify(newArtwork), 'Success'];
}
function JsonIsValidArtwork(jsonObject) {
    // Check for required top-level fields
    const requiredFields = ['name', 'sciName', 'description', 'images', 'events'];
    for (const field of requiredFields) {
        if (!(field in jsonObject))
            return [false, { error: `invalid ${field}: must exist` }];
    }
    // name must be a non-empty string
    if (typeof jsonObject.name !== 'string' || jsonObject.name.trim().length < 1) {
        return [false, { error: 'invalid name: must have a length of at least 1' }];
    }
    // image must be a non-empty string
    if (typeof jsonObject.image !== 'string' || jsonObject.name.trim().length < 1) {
        return [false, { error: 'invalid name: must have a length of at least 1' }];
    }
    // description must be an array with at least 2 items
    if (!Array.isArray(jsonObject.description) || jsonObject.description.length < 2) {
        return [false, { error: 'invalid description: must contain at least 2 items' }];
    }
    return [true, null];
}
function newlineBetweenItems(items) {
    let result = '';
    for (const item of items) {
        result += `${item}\n`;
    }
    return result;
}
