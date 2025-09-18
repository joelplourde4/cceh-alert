import fetch from "node-fetch";
import { warn } from "./logger.js";

const webhookURL = process.env.WEBHOOK_URL;

export function validateConfiguration() {
    if (!webhookURL) {
        warn("WEBHOOK_URL environment variable is not set.");
    }
}

/**
 * Send a message to a Discord webhook with retry logic.
 * Retries up to 5 times if the request fails or network error occurs.
 *
 * @param {string} message    - Text content (max 2000 chars)
 */
export async function sendDiscordAlert(message) {
    if (!webhookURL) {
        console.error('sendDiscordAlert: Missing webhookURL');
        return;
    }

    const maxRetries = 5;
    const delayMs = 1000; // 1 second between attempts

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            console.log(`Discord alert sent on attempt ${attempt}`);
            return;
        } catch (err) {
            console.error(`Discord alert attempt ${attempt} failed:`, err);

            if (attempt < maxRetries) {
                // Simple delay before retrying
                await new Promise(r => setTimeout(r, delayMs));
            } else {
                console.error('Discord alert failed after 5 attempts.');
            }
        }
    }
}