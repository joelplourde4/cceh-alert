// Read the contents of data/results.json and log the number of items found
const fs = require("fs");

if (fs.existsSync("./data/backup.json") === false) {
    console.error("Error: backup.json file not found. Please run the scrape script at least twice to create a backup.");
    process.exit(1);
}

if (fs.existsSync("./data/source.json") === false) {
    console.error("Error: source.json file not found. Please run the scrape script first.");
    process.exit(1);
}

// Load the backup file first
const backupRaw = fs.readFileSync("./data/backup.json", "utf8");
const backupData = JSON.parse(backupRaw);

// Then load the current source file
const sourceRaw = fs.readFileSync("./data/source.json", "utf8");
const sourceData = JSON.parse(sourceRaw);

// Create a map of backup items for easy lookup
const backupMap = new Map();
backupData.data.forEach(item => {
    backupMap.set(item.name, item);
});

// Analyze changes between sourceData and backupData
sourceData.data.forEach(item => {
    const backupItem = backupMap.get(item.name);
    if (!backupItem) {
        console.log(`New item found: ${item.name}`);
    } else if (JSON.stringify(item) !== JSON.stringify(backupItem)) {
        console.log(`Item changed: ${item.name}`);
        // Compare fields and show differences
        Object.keys(item).forEach(key => {
            if (item[key] !== backupItem[key]) {
                if (key === "buyingPrice") {
                    // Check if the price change is higher than before
                    const oldPrice = parseFloat(backupItem[key]);
                    const newPrice = parseFloat(item[key]);

                    if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice > oldPrice) {
                        console.log(`  - ${key}: ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (increased)`);
                    }
                }

                if (key === "sellingPrice") {
                    // Check if the price change is lower than before
                    const oldPrice = parseFloat(backupItem[key]);
                    const newPrice = parseFloat(item[key]);
                    if (!isNaN(oldPrice) && !isNaN(newPrice) && newPrice < oldPrice) {
                        console.log(`  - ${key}: ${backupItem[key]} -> \x1b[32m${item[key]}\x1b[0m (decreased)`);
                    }
                }
            }
        });
    }
});