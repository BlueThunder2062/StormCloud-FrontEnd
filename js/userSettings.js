console.log("userSettings.js loaded");

const backendString = "https://stormcloud-backend.onrender.com";//"http://localhost:3000";

//components
const waitScreen = document.getElementById("waitForConnection")
const mainScreen = document.getElementById("settings-wrapper")
const txtUsername = document.getElementById("username-display")
const imgUserIcon = document.getElementById("userIcon")
const borderSelect = document.getElementById("border-select");
const titleSelect = document.getElementById("title-select");
const hiddenSettings = document.getElementById("hiddenSettings");
const logoutLink = document.getElementById("logoutLink");

//Heartbeat that keeps the server awake as long as the user is on the website
import { startHeartbeat } from "./heartbeat.js";
startHeartbeat(backendString + "/ping");

//hides the screen at the start
mainScreen.style.visibility = "hidden";

//hides the hidden settings that aren't used yet
hiddenSettings.style.visibility = "hidden";

fetch(backendString + "/checkSession", {
    method: "POST",
    credentials: "include"   // ← sends the real session cookie automatically
})
.then(res => res.json())
.then(data => {
    if (data.valid) {
        
        //valid data so user can stay
        //get the home page data and display it

        //gets rid of the disclaimer and shows the main screen
        waitScreen.style.display = "none";
        mainScreen.style.visibility = "visible";

        setDefaultColors();

        getAndDisplayUserSettingsPageData();

    } else {
        
        window.location.href = "index.html";

    }
})
.catch(err => {
    
    window.location.href = "index.html";

});

//gets and displays the home page data
function getAndDisplayUserSettingsPageData(){

    fetch(backendString + "/getUserSettingsPageData", {
        method: "POST",
        credentials: "include"   // ← sends the real session cookie automatically
    })
    .then(res => res.json())
    .then(data => {

        //handle displaying data here

        txtUsername.textContent = data.username;

        if(data.profilePic != null){

            imgUserIcon.src = data.profilePic;

        }
        
    })
    .catch(err => {
        
        //console.log(err);
        window.location.href = "index.html";

    });

}

imgUserIcon.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // 10 MB limit
    const maxSize = 10000000; // 10 MB in bytes

    if (file.size > maxSize) {
        alert("Image is too large. Maximum size is " + (maxSize / 1000000) + " MB.");
        return;
    }

    const base64 = await toBase64(file);

    await fetch(backendString + "/uploadProfilePic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
        credentials: "include"
    });

    location.reload();

});

logoutLink.addEventListener("click", async () => {

    fetch(backendString + "/logout", {
        method: "POST",
        credentials: "include"
    })
    .then(() => {
        window.location.href = "index.html";
    });
    
})

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // produces "data:image/png;base64,AAAA..."
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

function setDefaultColors(){

    // Background of entire page
    document.documentElement.style.setProperty('--bg', '#524c59'); 

    // Global text color
    document.documentElement.style.setProperty('--text-color', '#bfdaec');

    // Username text color
    document.documentElement.style.setProperty('--username-color', '#bfdaec');

    // Title label color (the labels above dropdowns)
    document.documentElement.style.setProperty('--title-color', '#bfdaec');

    // Dropdown background color
    document.documentElement.style.setProperty('--dropdown-bg', '#2d2d31');

    // Dropdown border color
    document.documentElement.style.setProperty('--dropdown-border', '#524c59');

    // Accent color (hover/focus glow)
    document.documentElement.style.setProperty('--accent', '#bfdaec');

    //Sets the color of the home Link
    document.documentElement.style.setProperty('--link-color', '#bfdaec');

    //Sets the color of the home link when hovered over
    document.documentElement.style.setProperty('--link-hover-color', '#b6aa00');

}
