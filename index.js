const scrapeData = require('./scripts/scrape');
const runAnalysis = require('./scripts/analyze');
const { validateConfiguration } = require('./lib/alerts');

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