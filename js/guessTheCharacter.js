console.log("guessTheCharacter.js loaded");

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

        //gets rid of the disclaimer and shows the main screen
        waitScreen.style.display = "none";
        selectFileScreen.classList.remove("hidden");

        userId = data.userId;

        getAndDisplaySavedGames();

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

const createGameBtn = document.getElementById("addGameBtn")
//const addTeamBtn = document.getElementById("addTeam");

let players = [];
let username;

createGameBtn.addEventListener("click", async () => {

    selectFileScreen.classList.add("hidden");
    createGameScreen.classList.remove("hidden");

    const response = await fetch(backendString + "/getAllUsers");
    const data = await response.json();

    const users = data.users.filter(user => user._id !== userId);

    username = data.users.find(
        user => user._id === userId
    )?.username;

    //reset players to have a clean slate
    players = [];

    for(let i = 0; i < users.length; i++){

        //adds all users to the players list
        players.push(users[i].username);

    }

    addTeam();

});

let teams = [];
let nextTeamId = 0;

document.getElementById("addTeam").addEventListener("click", addTeam);

function addTeam() {

    const team = {
        id: nextTeamId++,
        image: null,
        players: [],
        revealed: false
    };

    teams.push(team);

    renderTeams();
}

function renderTeams() {

    const container =
        document.getElementById("teamContainer");

    // Remove old team cards
    container.innerHTML = "";

    teams.forEach(team => {

        const card = document.createElement("div");
        card.className = "team-card";

        const imageUpload = document.createElement("div");
        imageUpload.className = "team-image-upload";

        const image = document.createElement("img");
        image.className = "team-image";

        image.src = team.image || "images/UploadCharacter.png";

        image.alt = "Upload Team Image";

        imageUpload.appendChild(image);

        card.appendChild(imageUpload);

        const fileInput = document.createElement("input");

        fileInput.type = "file";
        fileInput.accept = "image/*";

        fileInput.style.display = "none";

        imageUpload.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", () => {

            const file = fileInput.files[0];

            if (!file) {
                return;
            }

            const reader = new FileReader();

            reader.onload = function(event) {

                team.image = event.target.result;

                renderTeams();
            };

            reader.readAsDataURL(file);
        });

        card.appendChild(fileInput);

        const select = document.createElement("select");
        select.className = "player-select";

        select.innerHTML =
            '<option selected disabled value="">Add Player</option>';

        players.forEach(player => {

            const option =
                document.createElement("option");

            option.value = player;
            option.textContent = player;

            select.appendChild(option);
        });

        // Event listener for THIS team
        //this will add the player to this team and rerender everything
        select.addEventListener("change", () => {

            console.log("Change event fired");

            if (select.value === "")
                return;

            team.players.push(select.value);

            console.log(teams);

            const index = players.indexOf(select.value);

            if (index !== -1) {
                players.splice(index, 1);
            }

            renderTeams();
        });

        const playerList =
            document.createElement("div");

        playerList.className = "player-list";

        playerList.innerHTML =
            "<strong>Selected Players:</strong>";

        team.players.forEach(player => {

            const playerDiv =
                document.createElement("div");

            playerDiv.textContent = player;

            playerList.appendChild(playerDiv);
        });

        card.appendChild(select);
        card.appendChild(playerList);

        container.appendChild(card);

    });

    // Re-add the + card
    const addButton = document.createElement("div");
    addButton.className = "add-team-card";
    addButton.id = "addTeam";
    addButton.textContent = "+";

    container.appendChild(addButton);

    document
        .getElementById("addTeam")
        .addEventListener("click", addTeam);
}

const createGameButton = document.getElementById("createGameButton");

createGameButton.addEventListener("click", createGame);

async function createGame(event) {

    createGameButton.style.pointerEvents = "none";
    createGameButton.style.opacity = "0.5";

    //prevents link stuff since it's not technically a button tag
    event.preventDefault();

    const gameData = {
        
        theme: document.getElementById("themeInput").value,
        teams: teams

    };

    if (!themeInput.value.trim()) {

        alert("Please enter a theme. (Put any text if you don't want a theme)");

        createGameButton.style.pointerEvents = "auto";
        createGameButton.style.opacity = "1";

        return;
    }

    for (const team of teams) {

        if (!team.image) {

            alert("Every team must have an image.");

            createGameButton.style.pointerEvents = "auto";
            createGameButton.style.opacity = "1";

            return;
        }

        if (team.players.length === 0) {

            alert("Every team must have at least one player.");

            createGameButton.style.pointerEvents = "auto";
            createGameButton.style.opacity = "1";

            return;
        }

    }

    const response = await fetch(
        backendString + "/createGuessCharacterGame",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(gameData)
        }
    );

    if (!response.ok) {

        createGameButton.style.pointerEvents = "auto";
        createGameButton.style.opacity = "1";

        alert("Failed to create game.");

        return;
    }

    // Success
    location.reload();

}

let savedGames = [];

async function getAndDisplaySavedGames() {

    const response = await fetch(
        backendString + "/getAllGuessTheCharacterGames"
    );

    const data = await response.json();

    savedGames = data.games;

    const characterGrid =
        document.getElementById("characterGrid");

    savedGames.forEach((game, index) => {

        const gameCard =
            document.createElement("div");

        gameCard.className = "game-card";

        gameCard.innerHTML = `
            <div class="game-value">
                ${index + 1}
            </div>
            <p>${game.theme}</p>
        `;

        gameCard.addEventListener("click", () => {
            gameClicked(game);
        });

        characterGrid.appendChild(gameCard);

    });

}

let currentGame;
const userImage = document.getElementById("currentTeamImage");

function gameClicked(game) {

    console.log(game);

    currentGame = game;

    selectFileScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    
    const themeText = document.getElementById("gameTheme");

    themeText.textContent = game.theme;

    const userImageData = game.teams.find(team =>
        team.players.includes(username)
    )?.image;

    if (userImageData) {
        userImage.src = userImageData;
    }

    //display the teams
    const otherTeamsContainer =
    document.getElementById("otherTeamsContainer");

    otherTeamsContainer.innerHTML = "";

    const userTeam = currentGame.teams.find(team =>
        team.players.includes(username)
    );

    currentGame.teams.forEach(team => {

        // Skip the user's own team
        if (team === userTeam) {
            return;
        }

        const teamDiv = document.createElement("div");
        teamDiv.className = "opponent-team";

        const image = document.createElement("img");
        image.className = "opponent-team-image";
        image.src = "images/GuessTheCharacterMouseOff.png";
        image.alt = "Team Character";

        const revealButton =
            document.createElement("button");

        revealButton.className = "reveal-button";
        revealButton.textContent = "Reveal";

        const playerList =
            document.createElement("div");

        playerList.className = "team-player-list";

        team.players.forEach(player => {

            const playerDiv =
                document.createElement("div");

            playerDiv.textContent = player;

            playerList.appendChild(playerDiv);

        });

        teamDiv.appendChild(image);
        teamDiv.appendChild(revealButton);
        teamDiv.appendChild(playerList);

        otherTeamsContainer.appendChild(teamDiv);

    });

}