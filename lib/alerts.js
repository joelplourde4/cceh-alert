const fetch = require("node-fetch");

const webhookURL = "https://discord.com/api/webhooks/1416406210969735169/bs5Aoho-gcj2F-GVWMZJDIFqAtr_8EYUevt1MCqqGt_2kuzvl9Pzv5eGse1zeVbb8T4I";

function sendDiscordAlert(message) {
    fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
    });
};

module.exports = { sendDiscordAlert };