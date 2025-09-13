const scrapeData = require('./scripts/scrape');
const runAnalysis = require('./scripts/analyze');

const INTERVAL = 15 * 60 * 1000; // 15 minutes

/**
 * Runs the scrape and analyze scripts in sequence.
 */
async function runScripts() {
    await scrapeData();

    await runAnalysis();
}

console.log("Running scripts. Press Ctrl+C to stop.");

// Run immediately on start
runScripts();

setInterval(runScripts, INTERVAL);