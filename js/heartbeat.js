//This file is the code that keeps the server awake as long as the user is on the server

let heartbeatInterval = null;

export function startHeartbeat(url) {
    if (heartbeatInterval) return;

    // Ping immediately to start waking the server
    fetch(url).catch(() => {});

    heartbeatInterval = setInterval(() => {
        fetch(url).catch(() => {});
    }, 60 * 1000);
}

export function stopHeartbeat() {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
}
