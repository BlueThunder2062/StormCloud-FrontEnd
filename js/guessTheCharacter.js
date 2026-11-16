console.log("gamesRanking.js loaded");

const backendString = "https://stormcloud-backend.onrender.com";//"http://localhost:3000";

//components
const waitScreen = document.getElementById("waitForConnection")

const selectFileScreen = document.getElementById("screen1");
const createGameScreen = document.getElementById("screen2");
const gameScreen = document.getElementById("screen3");

//hides the screen at the start
selectFileScreen.classList.add("hidden");

let userId;

fetch(backendString + "/checkSession", {
    method: "POST",
    credentials: "include"   // ← sends the real session cookie automatically
})
.then(res => res.json())
.then(async data => {
    if (data.valid) {
        
        //valid data so user can stay
        //get the home page data and display it

        //gets rid of the disclaimer and shows the main screen
        waitScreen.style.display = "none";
        selectFileScreen.classList.remove("hidden");

        userId = data.userId;

    } else {
        
        window.location.href = "index.html";

    }
})
.catch(err => {
    
    window.location.href = "index.html";

});

const createGameBtn = document.getElementById("addGameBtn")

createGameBtn.addEventListener("click", async () => {

    selectFileScreen.classList.add("hidden");
    createGameScreen.classList.remove("hidden");

    const response = await fetch("/getAllUsers");
    const data = await response.json();

    const users = data.users.filter(user => user._id !== userId);

    for(let i = 0; i < users.length; i++){

        console.log(users[i].username)

    }

});

playerSelect.addEventListener("change", () => {

    const selectedPlayer = playerSelect.value;

    // Add player to list here

    playerSelect.selectedIndex = 0;
});