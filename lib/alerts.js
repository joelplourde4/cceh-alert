const fetch = require("node-fetch");
const { warn } = require("./logger");

const webhookURL = process.env.WEBHOOK_URL;

function validateConfiguration() {
    if (!webhookURL) {
        warn("WEBHOOK_URL environment variable is not set.");
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