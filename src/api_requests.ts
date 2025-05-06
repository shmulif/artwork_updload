import { JsonObject, Artwork, AnimalEvent } from './interfaces.js'

// // Get URL parameters
// const urlParams = new URLSearchParams(window.location.search)
// const id = urlParams.get('id')


const domain: string = 'https://artworkbackend-production.up.railway.app'

async function fetchJsonSimple(url: string): Promise<[number, any]> {
     // call out to API for  data
     const response = await fetch(url)

     // Check if the response was successful
     if (response.ok) {

        // Convert the JSON data the request sent back to a JavaScript object    
        const data = await response.json() 

        // Return the sucess response with the data
        return [response.status, data]
    
    } else {

        // Return the response status and null if not successful
        return [response.status, null]

    }
     
}

async function fetchJson(
    url: string,
    headers: Record<string, string> = {}, 
): Promise<[number, JsonObject | JsonObject[]]> {
    try {
        // Prepare the fetch options
        const options: RequestInit = {
            method: 'GET',
            headers: {
                ...headers // Spread additional headers if provided
            },
        }

        // Fetch data from the API
        const response = await fetch(url, options)
        const responseJson: JsonObject | JsonObject[] = await response.json()

        return [response.status, responseJson]

    } catch (error) {
        // localStorage.setItem('log', `client side error ${error}`)
        return [500, { error: error } ]
    }
}


async function postJson(
    url: string,
    headers: Record<string, string>,
    body: object,
): Promise<[number, JsonObject | string]> {
    try {
        // Merge default and custom headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers
        }

        // Prepare the request options
        const options: RequestInit = {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(body)
        }

        // Make the POST request
        const response = await fetch(url, options)

        // Read the response data (JSON or plain text)
        let data: JsonObject | string;

        try {
            data = await response.json();
        } catch {
            data = await response.text(); // Fallback to text if JSON parsing fails
        }

        return [response.status, data];

    } catch (error) {
        return [500, { error: (error as Error).message }];
    }
}

export async function fetchAllAnimals(): Promise<[number, Artwork[]]> { 

    const url: string = `${domain}/animals`
    const [response, result]: [number, JsonObject | JsonObject[]] = await fetchJson(url)
    
        // Safely cast the result to an Animal[] if it matches the expected structure
        if (Array.isArray(result)) { //consider incorparating: && result.every(isAnimal)
            return [response, result as Artwork[]]
        } else {
            // Handle the case where the result is not an array of Animal objects
            console.error("Unexpected response format:", result);
            return [response, []]; // Return an empty array on error
        }

    
}

export async function fetchOneAnimal(id: string): Promise<[number, Artwork]> { 

    const url: string = `${domain}/animals/${id}`
    const [response, result]: [number, JsonObject] = await fetchJson(url)

    // convert JsonObject to Animal
    const artwork: Artwork = result as Artwork

    return [response, artwork]
    
}

export async function login(username: string, password: string): Promise<[number, JsonObject | string]> { 

    const url: string = `${domain}/login`
    const [response, result]: [number, JsonObject | string ] = await postJson(url, {}, {username, password} )
    return [response, result]
    
}

export async function createAnimal(authToken: string, jsonString: string): Promise<[number, JsonObject]> { 

    const url: string = `${domain}/animals`
    const [response, result]: [number, JsonObject | string] = await postJson(url, { token: authToken }, {jsonString})
    return [response, result as JsonObject]
    
}

export async function getAdminUserProfile(authToken: string): Promise<[number, JsonObject]> { 

    const url: string = `${domain}/user`
    const [response, result]: [number, JsonObject] = await fetchJson(url, { token: authToken })
    return [response, result]
    
}

// Animal verification
// Helper function to check if an object is of type Animal
function isArtwork(obj: any): obj is Artwork {
    return obj && 
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.image === 'string' &&
        Array.isArray(obj.description) && obj.description.every((desc: any) => typeof desc === 'string') &&
        typeof obj.createdByUser === 'string'
}

