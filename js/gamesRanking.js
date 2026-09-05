console.log("gamesRanking.js loaded");

const backendString = "http://localhost:3000";

//components
const waitScreen = document.getElementById("waitForConnection")
const mainScreen = document.getElementById("app-container")

//hides the screen at the start
mainScreen.style.visibility = "hidden";

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
        mainScreen.style.visibility = "visible";

        userId = data.userId;

        //gets all the games and sets up the screen
        await loadGamesAndUsers();

        sortGamesByGivenUsersIdScore(userId);

        renderGames();

    } else {
        
        window.location.href = "index.html";

    }
})
.catch(err => {
    
    window.location.href = "index.html";

});

//Heartbeat that keeps the server awake as long as the user is on the website
import { startHeartbeat } from "./heartbeat.js";
startHeartbeat(backendString + "/ping");

function setColor(variable, value) {
    document.documentElement.style.setProperty(variable, value);
}

setColor("--bg", "#1d0025");
setColor("--sidebar-bg", "#1d002e");
setColor("--button-bg", "#30003b");
setColor("--button-bg-hover", "#370047");
setColor("--button-text", "#ffffff");
setColor("--sidebar-text", "#fff");
setColor("--main-text", "#fff");
setColor("--game-list-bg", "#1b002b");
setColor("--game-item-bg", "#2b003f");
setColor("--user-list-bg", "#1c0029");
setColor("--user-item-bg", "#38003f");
setColor("--game-score-text", "#fff")
setColor("--input-text-hover", "#000")
setColor("--add-game-btn", "#8f0030");
setColor("--add-game-btn-text", "#320036");
setColor("--add-game-btn-hover", "#ff0055");
setColor("--searchbox-bg", "#c300ff");
setColor("--searchbox-placeholder-color", "#790239");

const dialog = document.getElementById("myDialog");
const addGameBtn = document.getElementById("add-game-btn");
const confirmBtn = document.getElementById("confirmBtn");
const cancelBtn = document.getElementById("cancelBtn");

//brings up dialog when user clicks add game
addGameBtn.addEventListener("click", () => {
    dialog.showModal();
});

//removes text from dialog if user clicks cancel
cancelBtn.addEventListener("click", () => {

    document.getElementById("userInput").value = "";

});

//when user clicks confirm adds the game to the list of games
confirmBtn.addEventListener("click", async () => {
    const gameName = document.getElementById("userInput").value;
    
    if(gameName == "" || !gameName){

        return;

    }

    fetch(backendString + "/addGame", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ gameName })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Backend responded:", data);
        
        location.reload();

    });

});

//this holds all the games and their info
let games;

let otherUsers;

async function loadGamesAndUsers() {

    const res = await fetch(backendString + "/getAllGamesAndUsers");
    const data = await res.json();

    games = data.games;
    otherUsers = data.users;

    otherUsers = otherUsers.filter(u => u._id !== userId);

    renderUsers(otherUsers);

}

function sortGamesByGivenUsersIdScore(id){

    games.sort((a, b) => {
        const scoreA = a.scores.find(s => s.userId === id)?.score ?? -Infinity;
        const scoreB = b.scores.find(s => s.userId === id)?.score ?? -Infinity;
        return scoreB - scoreA;
    });

}

function sortGamesAlphabetically(){

    games.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

}

function sortGamesByGlobalRanking(){

    games.sort((a, b) => {
        const avgA = averageScore(a.scores);
        const avgB = averageScore(b.scores);
        return avgB - avgA;
    });

}

//gets the average score. if there is no average score then it is treated as -infinity
function averageScore(scores) {
    if (!scores || scores.length === 0) return -Infinity;
    return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}


//gets the top three buttons on the left and attatches listeners
const sortButtons = document.querySelectorAll("#sort-options .sort-btn");

sortButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        handleSort(btn.textContent);
    });
});

function handleSort(type) {
    if (type === "Alphabetical") {
        
        sortGamesAlphabetically();

    }

    if (type === "User Ranking") {
        
        sortGamesByGivenUsersIdScore(userId);

    }

    if (type === "Global Ranking") {
        
        sortGamesByGlobalRanking();

    }

    renderGames(); // re-renders the UI
}

// SEARCH BOX
const searchBox = document.getElementById("searchbox");

// FILTER CHECKBOXES
const ownedCheckboxFilter     = document.querySelector('#filters .filter-column:nth-child(1) label:nth-child(1) input');
const unownedCheckboxFilter   = document.querySelector('#filters .filter-column:nth-child(1) label:nth-child(2) input');

const playedCheckboxFilter    = document.querySelector('#filters .filter-column:nth-child(2) label:nth-child(1) input');
const unplayedCheckboxFilter  = document.querySelector('#filters .filter-column:nth-child(2) label:nth-child(2) input');

const beatenCheckboxFilter    = document.querySelector('#filters .filter-column:nth-child(3) label:nth-child(1) input');
const unbeatenCheckboxFilter  = document.querySelector('#filters .filter-column:nth-child(3) label:nth-child(2) input');

searchBox.addEventListener("input", () => {
    renderGames();
});

ownedCheckboxFilter.addEventListener("change", () => {
    unownedCheckboxFilter.checked = false;
    renderGames();
});

unownedCheckboxFilter.addEventListener("change", () => {
    ownedCheckboxFilter.checked = false;
    renderGames();
});

playedCheckboxFilter.addEventListener("change", () => {
    unplayedCheckboxFilter.checked = false;
    renderGames();
});

unplayedCheckboxFilter.addEventListener("change", () => {
    playedCheckboxFilter.checked = false;
    renderGames();
});

beatenCheckboxFilter.addEventListener("change", () => {
    unbeatenCheckboxFilter.checked = false;
    renderGames();
});

unbeatenCheckboxFilter.addEventListener("change", () => {
    beatenCheckboxFilter.checked = false;
    renderGames();
});


function renderGames() {
    const gameList = document.getElementById("game-list");
    gameList.innerHTML = ""; // clear old items

    games.forEach(game => {

        //check if we shouldn't add the game as it's removed from a filter

        if(game.name.toLowerCase().includes(searchBox.value.toLowerCase()) == false){

            console.log(game.name + " search");
            return;

        }

        if((ownedCheckboxFilter.checked && game.owners.includes(userId) == false) ||
            (unownedCheckboxFilter.checked && game.owners.includes(userId))){

                console.log(game.name + " owned unowned");
            return;

        }

        if((playedCheckboxFilter.checked && game.played.includes(userId) == false) ||
            (unplayedCheckboxFilter.checked && game.played.includes(userId))){

            console.log(game.name + " played unplayed");
            return;

        }

        if((beatenCheckboxFilter.checked && game.beaten.includes(userId) == false) ||
            (unbeatenCheckboxFilter.checked && game.beaten.includes(userId))){

            console.log(game.name + " beaten unbeaten");
            return;

        }

        // Outer container
        const item = document.createElement("div");
        item.className = "game-item";

        // Title
        const title = document.createElement("div");
        title.className = "game-title";
        title.textContent = game.name;
        item.appendChild(title);

        // Flags container
        const flags = document.createElement("div");
        flags.className = "game-flags";

        // Owned checkbox
        const ownedLabel = document.createElement("label");
        const ownedCheckbox = document.createElement("input");
        ownedCheckbox.type = "checkbox";
        ownedCheckbox.checked = game.owners.includes(userId);
        ownedCheckbox.addEventListener("change", () => {
            handleOwnedChange(game, ownedCheckbox.checked);
        });
        ownedLabel.appendChild(ownedCheckbox);
        ownedLabel.append("Own");
        flags.appendChild(ownedLabel);

        // Score textbox
        const scoreBox = document.createElement("input");
        scoreBox.className = "game-score";
        scoreBox.type = "text";

        // find user's score if exists
        const userScoreObj = game.scores.find(s => s.userId === userId);
        if(userScoreObj){

            scoreBox.value = userScoreObj ? userScoreObj.score : "";

        }

        scoreBox.addEventListener("change", () => {
            handleScoreChange(game, scoreBox.value);
        });

        //this is here so beatenCheckbox can see it
        const playedCheckbox = document.createElement("input");

        // Beaten checkbox
        const beatenLabel = document.createElement("label");
        const beatenCheckbox = document.createElement("input");
        beatenCheckbox.type = "checkbox";
        beatenCheckbox.checked = game.beaten.includes(userId);
        beatenCheckbox.addEventListener("change", () => {
            handleBeatenChange(game, beatenCheckbox.checked, scoreBox, playedCheckbox);
        });
        beatenLabel.appendChild(beatenCheckbox);
        beatenLabel.append("Beat");

        // Played checkbox
        const playedLabel = document.createElement("label");
        
        playedCheckbox.type = "checkbox";
        playedCheckbox.checked = game.played.includes(userId);
        playedCheckbox.addEventListener("change", () => {
            handlePlayedChange(game, playedCheckbox.checked, scoreBox, beatenCheckbox);
        });
        
        playedLabel.appendChild(playedCheckbox);
        playedLabel.append("Played");
        flags.appendChild(playedLabel);

        flags.appendChild(beatenLabel);

        item.appendChild(flags);

        item.appendChild(scoreBox);

        scoreBox.readOnly = playedCheckbox.checked == false;

        // Add to page
        gameList.appendChild(item);
    });
}

function renderUsers(users) {

    const userList = document.getElementById("user-list");

    userList.innerHTML = ""; // clear existing buttons

    users.forEach(user => {
        const btn = document.createElement("button");
        btn.classList.add("user-btn");
        btn.textContent = user.username;

        // Attach an event listener unique to THIS user
        btn.addEventListener("click", () => {
            handleUserClick(user);
        });

        userList.appendChild(btn);
    });
}



function handleOwnedChange(game, isOwned) {

    if(isOwned){

        updateGameUserArray(game._id, "owners", userId, "add");

    }
    else{

        updateGameUserArray(game._id, "owners", userId, "remove");

    }

    loadGamesAndUsers();

}
function handlePlayedChange(game, isPlayed, scoreBox, beatenCheckbox) {

    if(isPlayed){

        scoreBox.readOnly = false;
        updateGameUserArray(game._id, "played", userId, "add");

    }
    else{

        scoreBox.value = "";
        scoreBox.readOnly = true;
        beatenCheckbox.checked = false;
        updateGameUserArray(game._id, "played", userId, "remove");
        updateGameUserArray(game._id, "beaten", userId, "remove");
        updateGameScore(game._id, userId, 0, "remove");

    }

    loadGamesAndUsers();

}
function handleBeatenChange(game, isBeaten, scoreBox, playedCheckbox) {

    if(isBeaten){

        if(playedCheckbox.checked == false){

            playedCheckbox.checked = true;
            updateGameUserArray(game._id, "played", userId, "add");

        }

        scoreBox.readOnly = false;

        updateGameUserArray(game._id, "beaten", userId, "add");

    }
    else{

        updateGameUserArray(game._id, "beaten", userId, "remove");

    }

    loadGamesAndUsers();

}

function handleScoreChange(game, newScore) {

    if(newScore == ""){

        updateGameScore(game._id, userId, newScore, "remove");

    }
    else if(isNaN(newScore)){

        showMessage("You must enter a valid number from 0 to 100, or leave it blank to remove your score.");

    }
    else{

        updateGameScore(game._id, userId, newScore, "addOrUpdate");

        loadGamesAndUsers();

    }

}

const messageDialog = document.getElementById("messageDialog");
const messageText = document.getElementById("messageText");
const messageCloseBtn = document.getElementById("messageCloseBtn");

messageCloseBtn.addEventListener("click", () => {
    messageDialog.close();
});

function showMessage(text) {
    messageText.textContent = text;
    messageDialog.showModal();
}


function updateGameUserArray(gameId, field, userId, action) {
    return fetch(backendString + "/updateGameUserArray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, field, userId, action })
    });
}

function updateGameScore(gameId, userId, score, action) {
    return fetch(backendString + "/updateGameScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, userId, score, action })
    });
}


function handleUserClick(user){

    sortGamesByGivenUsersIdScore(user._id);
    renderGames();

}