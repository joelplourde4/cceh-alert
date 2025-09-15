import { fetchData } from "./scripts/initialize.js";
import { scrapeData } from "./scripts/scrape.js";
import { runAnalysis } from "./scripts/analyze.js";
import { validateConfiguration } from "./lib/alerts.js";
import express from "express";
import { info } from "./lib/logger.js";

const INTERVAL = 15 * 60 * 1000; // 15 minutes

/**
 * Runs the scrape and analyze scripts in sequence.
 */
async function runScripts() {
    console.log("\n--- Price Check Cycle ---");
    await scrapeData();

    await runAnalysis();
    console.log("-------------------------");
}

info(`Running scripts every ${INTERVAL / 1000 / 60} minutes. Press Ctrl+C to stop.`);

validateConfiguration();

info("Starting initial data fetch...");
// Scrape data immediately on start so we have something to compare to.
fetchData().then(async () => {
    // Then run the analysis
    await runScripts();
});

// Then set an interval to run the scripts periodically
setInterval(runScripts, INTERVAL);

const app = express();

// Initialize a simple route
app.get("/", (req, res) => {
  res.send("The application is running. Check the logs for details.");
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    info(`Server running on port ${PORT}`);
    if (process.env.SELF_URL) {
        import("./lib/heartbeat.js");
        info("Heartbeat is active.");
    }
});