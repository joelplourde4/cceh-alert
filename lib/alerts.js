const fetch = require("node-fetch");

const webhookURL = process.env.WEBHOOK_URL;

function validateConfiguration() {
    if (!webhookURL) {
        console.warn("Discord webhook URL is not set. Skipping alert.");
    }
}

function sendDiscordAlert(message) {
    if (!webhookURL) {
        return;
    }

    fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
    });
};

module.exports = { 
    validateConfiguration,
    sendDiscordAlert
};