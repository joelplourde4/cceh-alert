const scrapeData = require('./scripts/scrape');
const runAnalysis = require('./scripts/analyze');
const { validateConfiguration } = require('./lib/alerts');
const express = require('express');

const INTERVAL = 15 * 60 * 1000; // 15 minutes

/**
 * Runs the scrape and analyze scripts in sequence.
 */
async function runScripts() {
    await scrapeData();

    await runAnalysis();
}

console.log("Running scripts. Press Ctrl+C to stop.");

validateConfiguration();

// Scrape data immediately on start so we have something to compare to.
scrapeData().then(() => {
    // Then run the analysis
    runScripts();
});

// Then set an interval to run the scripts periodically
setInterval(runScripts, INTERVAL);

const app = express();

// Simple route
app.get("/", (req, res) => {
  res.send("Hello from Render!");
});

// Render provides the port as an environment variable
const PORT = process.env.PORT || 8080;

// Bind to 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});