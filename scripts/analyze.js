import fs from "fs";
import { scrapeData } from "./scrape.js";
import { sendDiscordAlert } from "../lib/alerts.js";
import { info, warn } from "../lib/logger.js";
import { pushFileToGitHub } from "../lib/git.js";

/**
 * Runs analysis on the scraped data to identify changes.
 * Compares the current data with a backup and logs any differences.
 * Highlights price increases in green and decreases in red.
 */
export async function runAnalysis() {
    if (fs.existsSync("./data/backup.json") === false) {
        warn("backup.json file not found. Creating one by running the scrape script twice.");
        await scrapeData();
    }

    // Load the backup file first
    const backupData = JSON.parse(fs.readFileSync("./data/backup.json", "utf8"));

    // Then load the current source file
    const sourceData = JSON.parse(fs.readFileSync("./data/source.json", "utf8"));

    // Analyze changes between sourceData and backupData
    const { changesFound, results } = compare(backupData, sourceData);

    info(`${sourceData.data.length} resource prices have been analyzed.`);

    if (!changesFound) {
        info("No changes have been detected.");
    } else {

        info("Changes have been detected:");

        info("Sending Discord alert...");
        const formattedResults = formatResults(results);
        await sendDiscordAlert("Changes detected: \n" + formattedResults);

        info("Uploading the latest data.json to GitHub...");
        const json = JSON.stringify(sourceData, null, 2);

        // Upload the latest data to GitHub
        await pushFileToGitHub("data/data.json", json, `Update data.json - ${new Date().toISOString()}`);
    }
}

export function compare(backupData, sourceData) {
    // Create a map of backup items for easy lookup
    const backupMap = new Map();
    backupData.data.forEach(item => {
        backupMap.set(item.name, item);
    });

    let changesFound = false;

    let results = [];

    // Analyze changes between sourceData and backupData
    sourceData.data.forEach(item => {
        const backupItem = backupMap.get(item.name);
        if (!backupItem) {
            info(`New item found: ${item.name}`);
        } else if (JSON.stringify(item) !== JSON.stringify(backupItem)) {
            info(`Item changed: ${item.name}`);
            // Compare fields and show differences
            Object.keys(item).forEach(key => {
                if (item[key] !== backupItem[key]) {
                    if (key === "buyingPrice") {
                        // Check if the price change is higher than before
                        const oldPrice = parseFloat(backupItem[key]);
                        const newPrice = parseFloat(item[key]);

                        if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice > oldPrice) {
                            results.push(`- ${item.name}: (Buying Price) ${backupItem[key]} -> ${item[key]} (increased) ($)`);
                            info(`${item.name}: (Buying Price) ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (increased)`);
                        } else {
                            results.push(`- ${item.name}: (Buying Price) ${backupItem[key]} -> ${item[key]} (decreased)`);
                            info(`${item.name}: (Buying Price) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (decreased)`);
                        }
                    }

                    if (key === "sellingPrice") {
                        // Check if the price change is lower than before
                        const oldPrice = parseFloat(backupItem[key]);
                        const newPrice = parseFloat(item[key]);
                        if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice < oldPrice) {
                            results.push(`- ${item.name}: (Selling Price) ${backupItem[key]} -> ${item[key]} (decreased) ($)`);
                            info(`${item.name}: (Selling Price) ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (decreased)`);
                        } else {
                            results.push(`- ${item.name}: (Selling Price) ${backupItem[key]} -> ${item[key]} (increased)`);
                            info(`${item.name}: (Selling Price) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (increased)`);
                        }
                    }

                    if (key === "buyingQuantity") {
                        const oldQty = parseInt(backupItem[key]);
                        const newQty = parseInt(item[key]);
                        if (!isNaN(oldQty) && !isNaN(newQty) && newQty > oldQty) {
                            results.push(`- ${item.name}: (Buying Quantity) ${backupItem[key]} -> ${item[key]} (increased)`);
                            info(`${item.name}: (Buying Quantity) ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (increased)`);
                        } else {
                            results.push(`- ${item.name}: (Buying Quantity) ${backupItem[key]} -> ${item[key]} (decreased)`);
                            info(`${item.name}: (Buying Quantity) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (decreased)`);
                        }
                    }

                    if (key === "sellingQuantity") {
                        const oldQty = parseInt(backupItem[key]);
                        const newQty = parseInt(item[key]);
                        if (!isNaN(oldQty) && !isNaN(newQty) && newQty > oldQty) {
                            results.push(`- ${item.name}: (Selling Quantity) ${backupItem[key]} -> ${item[key]} (increased)`);
                            info(`${item.name}: (Selling Quantity) ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (increased)`);
                        } else {
                            if (newQty === 0) {
                                results.push(`- ${item.name}: (Selling Quantity) ${backupItem[key]} -> ${item[key]} (decreased) ($)`);
                                info(`${item.name}: (Selling Quantity) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (decreased)`);
                            } else {
                                results.push(`- ${item.name}: (Selling Quantity) ${backupItem[key]} -> ${item[key]} (decreased)`);
                                info(`${item.name}: (Selling Quantity) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (decreased)`);
                            }
                        }
                    }

                    changesFound = true;
                }
            });
        }
    });

    return { changesFound, results };
}

export function formatResults(results) {
    // For each results, convert null value to "N/A", then join them with a new line
    return results
        .map(line => line.replace(null, "N/A"))
        .join("\n");
}