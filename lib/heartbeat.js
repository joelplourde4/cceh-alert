const fetch = require("node-fetch");
const { info, error } = require("./logger");

const SELF_URL = process.env.SELF_URL;
if (!SELF_URL) {
    error("SELF_URL environment variable is not set. Heartbeat will not run.");
    return;
}
const HEARTBEAT_TIMEOUT = 30_000; // 30 seconds

info(`Heartbeat will ping ${SELF_URL} every ${HEARTBEAT_TIMEOUT / 1000} seconds.`);
// Ping every 30 seconds
setInterval(async () => {
    try {
        await fetch(SELF_URL);
    } catch (err) {
        error("Heartbeat failed:", err.message);
    }
}, HEARTBEAT_TIMEOUT);