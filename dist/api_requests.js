// // Get URL parameters
// const urlParams = new URLSearchParams(window.location.search)
// const id = urlParams.get('id')
const domain = 'http://localhost:3000';
async function fetchJsonSimple(url) {
    // call out to API for  data
    const response = await fetch(url);
    // Check if the response was successful
    if (response.ok) {
        // Convert the JSON data the request sent back to a JavaScript object    
        const data = await response.json();
        // Return the sucess response with the data
        return [response.status, data];
    }
    else {
        // Return the response status and null if not successful
        return [response.status, null];
    }
}
async function fetchJson(url, headers = {}) {
    try {
        // Prepare the fetch options
        const options = {
            method: 'GET',
            headers: {
                ...headers // Spread additional headers if provided
            },
        };
        // Fetch data from the API
        const response = await fetch(url, options);
        const responseJson = await response.json();
        return [response.status, responseJson];
    }
    catch (error) {
        // localStorage.setItem('log', `client side error ${error}`)
        return [500, { error: error }];
    }
}
async function postJson(url, headers, body) {
    try {
        // Merge default and custom headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        // Prepare the request options
        const options = {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(body)
        };
        // Make the POST request
        const response = await fetch(url, options);
        // Read the response data (JSON or plain text)
        let data;
        try {
            data = await response.json();
        }
        catch {
            data = await response.text(); // Fallback to text if JSON parsing fails
        }
        return [response.status, data];
    }
    catch (error) {
        return [500, { error: error.message }];
    }
}
export async function fetchAllAnimals() {
    const url = `${domain}/animals`;
    const [response, result] = await fetchJson(url);
    // Safely cast the result to an Animal[] if it matches the expected structure
    if (Array.isArray(result)) { //consider incorparating: && result.every(isAnimal)
        return [response, result];
    }
    else {
        // Handle the case where the result is not an array of Animal objects
        console.error("Unexpected response format:", result);
        return [response, []]; // Return an empty array on error
    }
}
export async function fetchOneAnimal(id) {
    const url = `${domain}/animals/${id}`;
    const [response, result] = await fetchJson(url);
    // convert JsonObject to Animal
    const artwork = result;
    return [response, artwork];
}
export async function login(username, password) {
    const url = `${domain}/login`;
    const [response, result] = await postJson(url, {}, { username, password });
    return [response, result];
}
export async function createAnimal(authToken, jsonString) {
    const url = `${domain}/animals`;
    const [response, result] = await postJson(url, { token: authToken }, { jsonString });
    return [response, result];
}
export async function getAdminUserProfile(authToken) {
    const url = `${domain}/user`;
    const [response, result] = await fetchJson(url, { token: authToken });
    return [response, result];
}
// Animal verification
// Helper function to check if an object is of type Animal
function isArtwork(obj) {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.image === 'string' &&
        Array.isArray(obj.description) && obj.description.every((desc) => typeof desc === 'string') &&
        typeof obj.createdByUser === 'string';
}
