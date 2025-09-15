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

    // Create a map of backup items for easy lookup
    const backupMap = new Map();
    backupData.data.forEach(item => {
        backupMap.set(item.name, item);
    });

    let changesFound = false;

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
                            sendDiscordAlert(`Buying Price increased for ${item.name}: ${oldPrice} -> ${newPrice} :chart_with_upwards_trend: :money_with_wings:`);
                            info(`${item.name}: (Buying Price) ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (increased)`);
                        } else {
                            sendDiscordAlert(`Buying Price decreased for ${item.name}: ${oldPrice} -> ${newPrice} :chart_with_downwards_trend:`);
                            info(`${item.name}: (Buying Price) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (decreased)`);
                        }
                    }

                    if (key === "sellingPrice") {
                        // Check if the price change is lower than before
                        const oldPrice = parseFloat(backupItem[key]);
                        const newPrice = parseFloat(item[key]);
                        if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice < oldPrice) {
                            sendDiscordAlert(`Selling Price decreased for ${item.name}: ${oldPrice} -> ${newPrice} :chart_with_downwards_trend: :money_with_wings:`);
                            info(`${item.name}: (Selling Price) ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (decreased)`);
                        } else {
                            sendDiscordAlert(`Selling Price increased for ${item.name}: ${oldPrice} -> ${newPrice} :chart_with_upwards_trend:`);
                            info(`${item.name}: (Selling Price) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (increased)`);
                        }
                    }

                    if (key === "buyingQuantity") {
                        const oldQty = parseInt(backupItem[key]);
                        const newQty = parseInt(item[key]);
                        if (!isNaN(oldQty) && !isNaN(newQty) && newQty > oldQty) {
                            sendDiscordAlert(`Buying Quantity increased for ${item.name}: ${oldQty} -> ${newQty} :small_red_triangle:`);
                            info(`${item.name}: (Buying Quantity) ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (increased)`);
                        } else {
                            sendDiscordAlert(`Buying Quantity decreased for ${item.name}: ${oldQty} -> ${newQty} :small_red_triangle_down:`);
                            info(`${item.name}: (Buying Quantity) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (decreased)`);
                        }
                    }

                    if (key === "sellingQuantity") {
                        const oldQty = parseInt(backupItem[key]);
                        const newQty = parseInt(item[key]);
                        if (!isNaN(oldQty) && !isNaN(newQty) && newQty > oldQty) {
                            sendDiscordAlert(`Selling Quantity increased for ${item.name}: ${oldQty} -> ${newQty} :small_red_triangle:`);
                            info(`${item.name}: (Selling Quantity) ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (increased)`);
                        } else {
                            sendDiscordAlert(`Selling Quantity decreased for ${item.name}: ${oldQty} -> ${newQty} :small_red_triangle_down:`);
                            info(`${item.name}: (Selling Quantity) ${backupItem[key]} -> \x1b[31m${item[key]}\x1b[0m (decreased)`);
                        }
                    }

                    changesFound = true;
                }
            });
        }
    });

    info(`${sourceData.data.length} resource prices have been analyzed.`);

    if (!changesFound) {
        info("No changes have been detected.");
    } else {
        info("Changes have been detected, uploading the latest file to GitHub.");

        const json = JSON.stringify(sourceData, null, 2);

        // Upload the latest data to GitHub
        await pushFileToGitHub("data/data.json", json, `Update data.json - ${new Date().toISOString()}`);
    }
}