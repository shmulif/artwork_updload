import { login } from './api_requests.js'
import { JsonObject } from './interfaces.js'

checkIfAlreadyLoggedIn()

// Figure out why this is redirecting user automatically
function checkIfAlreadyLoggedIn(){

    const authToken: string | null = localStorage.getItem('authToken')

    if (authToken !== null ){
        window.location.href = 'admin.html'
    }
}

declare global {
    interface Window {
        submitLogin: (event: Event) => void
    }
}

window.submitLogin = async function(event: Event) {
    event.preventDefault()
    
    clearError()

    const usernameInput = document.getElementById('username') as HTMLInputElement | null
    const passwordInput = document.getElementById('password') as HTMLInputElement | null

    if (usernameInput && passwordInput) {

        console.log('Username:', usernameInput.value)
        console.log('Password:', passwordInput.value)

        if (usernameInput.value === '') {
            alert('Username is invalid: cannot be empty!')
            return
            }
            if (passwordInput.value === '') {
            alert('Password is invalid: cannot be empty!')
            return
            }

        await handleLogin(usernameInput.value, passwordInput.value)
        

    } else {
        console.error('Username or password input not found')
    }
}


function displayError(): void {


    const pageDisplay = document.getElementById("error-message")
    
        // Check if the element exists before attempting to update it
    if (pageDisplay) {
        pageDisplay.style.color = "red"
        pageDisplay.innerHTML = `Error: Invalid Login`
    } else {
        console.error("Element with ID 'error-message' not found.")
    }

}

function clearError(): void {


    const pageDisplay = document.getElementById("error-message")
    
        // Check if the element exists before attempting to update it
    if (pageDisplay) {
        // Wait for the asynchronous function to complete
        pageDisplay.innerHTML = ''
    } else {
        console.error("Element with ID 'error-message' not found.")
    }

}

async function handleLogin(username: string, password: string): Promise<void> {
    try {
        // Call the login function and destructure the response and result
        const [status, result]: [number, string | JsonObject ] = await login(username, password);

        // Handle different status codes
        if (status === 201) {

            // Assert that result is a string (the auth token)
            if (typeof result === 'string') {
                console.log('Login successful!')
                console.log('Auth token:', result)

                // Put it into local storage
                localStorage.setItem('authToken', result)

                // Redirect user
                window.location.href = 'admin.html'
                

            } else {
                console.error('Unexpected response format for status 201.');
            }

        } else if (status === 400 || status === 401) {

            displayError()

            // Assert that result is an object with an error message
            if (typeof result === 'object' && 'error' in result) {
                
                console.error(`Login failed: ${result.error}`)
                alert(`Error: ${result.error}`)

            } else {
                console.error('Unexpected response format for error status.')

            }
        } else {
            console.error('Unexpected status code:', status)
        }

    } catch (error) {
        console.error('An error occurred during login:', error)
    }
}
