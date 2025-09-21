import fetch from "node-fetch";
import { warn } from "./logger.js";

let webhookURL = process.env.WEBHOOK_URL;

export function validateConfiguration() {
    if (!webhookURL) {
        warn("WEBHOOK_URL environment variable is not set.");
    }
}

/**
 * Send a message to a Discord webhook with retry logic.
 * Retries up to 5 times if the request fails or network error occurs.
 * Handles Discord 429 rate limiting by respecting the "retry_after" field.
 *
 * @param {string} message    - Text content (max 2000 chars)
 */
export async function sendDiscordAlert(message) {
    webhookURL = process.env.WEBHOOK_URL;
    if (!webhookURL) {
        console.error("sendDiscordAlert: Missing webhookURL");
        return;
    }

    const maxRetries = 5;
    const baseDelayMs = 1000; // fallback 1s if no retry_after

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(webhookURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: message }),
            });

            if (res.status === 429) {
                // Handle Discord rate limiting
                const data = await res.json();
                const retryAfter = (data.retry_after ?? 1) * 1000; // ms
                console.warn(
                    `Rate limited by Discord. Retrying after ${retryAfter}ms (attempt ${attempt})`
                );
                await new Promise((r) => setTimeout(r, retryAfter));
                continue;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            console.log(`Discord alert sent on attempt ${attempt}`);
            return;
        } catch (err) {
            console.error(`Discord alert attempt ${attempt} failed:`, err);

            if (attempt < maxRetries) {
                // Wait before retry (backoff for network/server errors)
                await new Promise((r) => setTimeout(r, baseDelayMs));
            } else {
                console.error("Discord alert failed after 5 attempts.");
            }
        }
    }
}