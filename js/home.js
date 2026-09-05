console.log("home.js loaded");

const backendString = "https://stormcloud-backend.onrender.com";//"http://localhost:3000";

//components
const waitScreen = document.getElementById("waitForConnection")
const mainScreen = document.getElementById("page-wrapper")
const txtAnnouncement = document.getElementById("announcement-text")
const txtUsername = document.getElementById("username-display")
const imgUserIcon = document.getElementById("userIcon")
//const voiceLoungeImage = document.getElementById("voiceLounge");
const gamesRankingImage = document.getElementById("gamesRanking");

//component that allows the user to input a file
const fileInput = document.getElementById("fileInput");

//hides the screen at the start
mainScreen.style.visibility = "hidden";

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

        getAndDisplayHomePageData();

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

//gets and displays the home page data
function getAndDisplayHomePageData(){

    fetch(backendString + "/getHomePageData", {
        method: "POST",
        credentials: "include"   // ← sends the real session cookie automatically
    })
    .then(res => res.json())
    .then(data => {

        //handle displaying data here

        txtAnnouncement.textContent = data.announcement;
        txtUsername.textContent = data.username;

        if(data.profilePic != null){

            imgUserIcon.src = data.profilePic;

        }

        if(data.scrollAnnouncement){

            makeAnnouncementScroll();

        }
        else{

            makeAnnouncementNotMove();

        }
        
    })
    .catch(err => {
        
        //console.log(err);
        window.location.href = "index.html";

    });

}

makeDefaultColors();
function makeDefaultColors(){

    // Change background color of ALL image tiles and the scroll bar
    document.documentElement.style.setProperty('--tile-bg', '#524c59');

    // Change background color BEHIND the images (the grid background)
    document.documentElement.style.setProperty('--bg', '#2d2d31');

    // Change background color of the announcement bar
    document.documentElement.style.setProperty('--announcement-bg', '#464961');

    // Change background color of the list items and scroll bar
    document.documentElement.style.setProperty('--accent', '#2d2d31');

    // Change TEXT color of the list items
    document.documentElement.style.setProperty('--text-color', '#bfdaec');

    // Change TEXT color of the announcement bar
    document.documentElement.style.setProperty('--announcement-text', '#bfdaec');

    //Change user menu background
    document.documentElement.style.setProperty('--sidebar-bg', '#524c59');

    // Change TEXT color of the username
    document.documentElement.style.setProperty('--username-color', '#bfdaec');

    // Change TEXT color of the user's title
    document.documentElement.style.setProperty('--title-color', '#bfdaec');

}


//this makes the announcement not move and display on the left
function makeAnnouncementNotMove(){

    const el = document.getElementById("announcement-text");
    el.classList.add("static-announcement");

}

//makes the announcement scroll. (Already does it by default)
function makeAnnouncementScroll() {

    const el = document.getElementById("announcement-text");
    el.classList.remove("static-announcement");

}

//updates when the scroll resets depending on the length of text
function updateAnnouncementSpeed() {
    const el = document.getElementById("announcement-text");

    // Measure how wide the text actually is
    const textWidth = el.scrollWidth;

    // Choose a speed factor (bigger = faster)
    const speedFactor = 80; // pixels per second

    // Calculate duration based on text length
    const duration = (textWidth / speedFactor);

    // Apply the duration to the animation
    el.style.animationDuration = duration + "s";
}

// Run once on load
//updateAnnouncementSpeed();

//takes user to user settings
imgUserIcon.addEventListener("click", () => window.location.href = "userSettings.html");


/*
//Takes user to voice chat lounge
voiceLoungeImage.addEventListener("click", () => window.location.href = "voiceChatLounge.html");


//makes it so the hover image is displayed when the mouse is hovered over
voiceLoungeImage.addEventListener("mouseenter", () => {
    voiceLoungeImage.src = "images/VoiceChatIconMouseOn.png";
});
voiceLoungeImage.addEventListener("mouseleave", () => {
    voiceLoungeImage.src = "images/VoiceChatIconMouseOff.png";
});*/


//Takes user to games ranking
gamesRankingImage.addEventListener("click", () => window.location.href = "gamesRanking.html");

//makes it so the hover image is displayed when the mouse is hovered over
gamesRankingImage.addEventListener("mouseenter", () => {
    gamesRankingImage.src = "images/GamesRankingMouseOn.png";
});
gamesRankingImage.addEventListener("mouseleave", () => {
    gamesRankingImage.src = "images/GamesRankingMouseOff.png";
});