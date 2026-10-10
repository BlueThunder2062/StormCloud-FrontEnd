console.log("Version 1");

//components
const waitScreen = document.getElementById("waitForConnection")
const mainScreen = document.getElementById("app-container")
const addShortChallengeBtn = document.getElementById("addShortChallengeBtn")
const addLongChallengeBtn = document.getElementById("addLongChallengeBtn")

//addShortChallengeBtn.disabled = true;
addLongChallengeBtn.disabled = true;

addShortChallengeBtn.addEventListener("click", () => {

    console.log("Short Button clicked!");

});

addLongChallengeBtn.addEventListener("click", () => {

    console.log("Long Button clicked!");

});