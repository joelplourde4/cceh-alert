import fetch from "node-fetch";
import { warn } from "./logger.js";

const webhookURL = process.env.WEBHOOK_URL;

export function validateConfiguration() {
    if (!webhookURL) {
        warn("WEBHOOK_URL environment variable is not set.");
    }
}

export function sendDiscordAlert(message) {
    if (!webhookURL) {
        return;
    }

    fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
    });
};