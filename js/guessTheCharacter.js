
const selectFileScreen = document.getElementById("screen1");
const createGameScreen = document.getElementById("screen2");
const gameScreen = document.getElementById("screen3");

const createGameBtn = document.getElementById("addGameBtn")

createGameBtn.addEventListener("click", () => {

    selectFileScreen.classList.add("hidden");
    createGameScreen.classList.remove("hidden");

});

playerSelect.addEventListener("change", () => {

    const selectedPlayer = playerSelect.value;

    // Add player to list here

    playerSelect.selectedIndex = 0;
});