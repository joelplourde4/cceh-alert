import fetch from "node-fetch";
import { info, error } from "./logger.js";

const SELF_URL = process.env.SELF_URL;
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