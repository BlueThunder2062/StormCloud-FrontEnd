console.log("login.js loaded");

//components
const txtUsername = document.getElementById("username")
const txtPassword = document.getElementById("password")
const btnLogIn = document.getElementById("logIn")
const btnSignUp = document.getElementById("signUp")
const lblError = document.getElementById("error")
const lblDisplay = document.getElementById("display")

const backendString = "http://localhost:3000";

//Heartbeat that keeps the server awake as long as the user is on the website
import { startHeartbeat } from "./heartbeat.js";
startHeartbeat(backendString + "/ping");

//initially sets the sign up button to not be visible
btnSignUp.disabled = true;
btnSignUp.style.visibility = "hidden";

let allowSignUp = false;

//sets whether the sign up button should be visible
fetch(backendString + "/getAllowSignUp", {
    method: "GET",
    credentials: "include"
})
.then(res => res.json())
.then(data => {
    if (data.allowSignUp) {

        btnSignUp.disabled = false;
        btnSignUp.style.visibility = "visible";
        allowSignUp = true;
    
    } else {
        
        btnSignUp.disabled = true;
        btnSignUp.style.visibility = "hidden";
        allowSignUp = false;

    }
});

//if the session cookie exists then we verify with the server to see if we can log the user in
if (document.cookie.includes("sessionExists=true")) {
    // Presence cookie exists

    btnLogIn.disabled = true;
    btnSignUp.disabled = true;

    displayText("Checking session credentials to log in... (If server was asleep this may take a minute)", false)

    fetch(backendString + "/checkSession", {
        method: "POST",
        credentials: "include"   // ← sends the real session cookie automatically
    })
    .then(res => res.json())
    .then(data => {
        if (data.valid) {
            
            //open home screen
            displayText("Credentials are correct, logging in.", false);
            window.location.href = "home.html";

        } else {
            displayText("Session invalid or expired. Please log in.", false);
            
            btnLogIn.disabled = false;
            btnSignUp.disabled = false;

        }
    })
    .catch(err => {
        displayText("Error verifying session. (You can attempt to log in but there may be a problem you should alert the admin of)", true);

        btnLogIn.disabled = false;
        btnSignUp.disabled = false;

    });


} else {
    // Presence cookie missing
    //do nothing and let the user log in
}

//Code that runs when Log In is clicked
btnLogIn.addEventListener("click", (event) => {

    event.preventDefault();

    const username = txtUsername.value;
    const password = txtPassword.value;

    displayText("",false);

    if(username === "" || password === ""){

        displayText("Please insert username and password",true);

        return;

    }

    btnLogIn.disabled = true;
    btnSignUp.disabled = true;

    displayText("Logging in... (If server was asleep this may take a minute)",false);

    attemptLogin(username,password);

});

//Code that runs when Sign In is clicked
btnSignUp.addEventListener("click", (event) => {

    event.preventDefault();

    const username = txtUsername.value;
    const password = txtPassword.value;

    displayText("",false);

    if(username === "" || password === ""){

        displayText("Please create username and password",true);

        return;

    }

    btnLogIn.disabled = true;
    btnSignUp.disabled = true;

    displayText("Signing up... (If server was asleep this may take a minute)",false);

    attemptSignup(username,password);

});

async function attemptLogin(username, password)
{

    const hashedPassword = await hashPassword(password);

    if(hashedPassword === null){

        btnLogIn.disabled = false;
        btnSignUp.disabled = false;

        return;

    }
    
    //check user's credentials and create session cookie
    const response = await fetch(backendString + "/createSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            username: username,
            password: hashedPassword
        })
    });

    const data = await response.json();

    const loggedIn = data.success;

    if(loggedIn === false){

        displayText("Username or Password incorrect.", true);

        btnLogIn.disabled = false;
        btnSignUp.disabled = false;

        return;

    }
    else{

        //open home screen
        displayText("Credentials are correct, logging in.", false);
        window.location.href = "home.html";

    }
    
}

async function attemptSignup(username, password)
{

    const hashedPassword = await hashPassword(password);

    if(hashedPassword === null){

        btnLogIn.disabled = false;
        btnSignUp.disabled = false;

        return;

    }
    
    ///checks to see if creation of account was successful
    const response = await fetch(backendString + "/signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username.trim(),
            password: hashedPassword
        })
    });

    const data = await response.json();

    let createdUser = data.success;

    //this means user already exists or sign ups are not allowed
    if(createdUser === false){

        displayText(data.reason, true);

        btnLogIn.disabled = false;
        btnSignUp.disabled = false;

    }
    //sign up successful, create a session cookie and open the home screen
    else{

        displayText("Account Created, logging in.", false);

        const response = await fetch(backendString + "/createSession", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                username: username,
                password: hashedPassword
            })
        });

        const data = await response.json();

        const loggedIn = data.success;

        //this shouldn't ever run
        if(loggedIn === false){

            displayText("Username or Password incorrect.", true);

            btnLogIn.disabled = false;
            btnSignUp.disabled = false;

            return;

        }
        else{

            //open home screen
            displayText("Credentials are correct, logging in.", false);
            window.location.href = "home.html";

        }

    }
    
}

//returns the given string as a hash. returns null if the browser does not support hashing
async function hashPassword(password)
{

    //Check for Web Crypto support
    if (!window.crypto || !window.crypto.subtle) {
        displayText("Web Crypto API is not supported. Use Chrome 79+.",true);
        return null;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;

}

//Clears out current text being displayed and displays given text to user. if isError is set to true the text will be red
function displayText(displayString, isError)
{

    lblDisplay.textContent = "";
    lblError.textContent = "";

    if(isError){

        lblError.textContent = displayString;
        
    }
    else{

        lblDisplay.textContent = displayString;

    }

}