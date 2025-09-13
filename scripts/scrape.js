const cheerio = require("cheerio");
const fs = require("fs");

// The categories to scrape
const CATEGORIES = [
    // "#actifsfinanciers",
    "#fichesdepopulation",
    "#lotsdebase",
    "#lotscomplexes",
    "#mainsdoeuvre",
    "#maitres",
    "#unitsmilitaires",
    "#unitsclandestines",
    "#unitsdexploration",
    "#unitsmaritimes",
    "#unitsesclaves",
    "#unitselfiques",
    "#unitsorques",
    "#unitsmilitairessurnaturelles",
    "#nergiesmagiques",
    "#composantessurnaturelles",
    "#objets",
    "#influences",
    "#minerais",
]

const RELATIVE_DATA_PATH = "./data/";

// Fetch the content of the page
const content = fetch("https://cceh.trade")
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.text();
  })
  .catch(error => {
    console.error("Fetch error:", error);
  });

const results = [];

// When the content is fetched, parse it
content.then(raw => {
    const $ = cheerio.load(raw);

    // For each row in the population cards section
    CATEGORIES.forEach(category => {
        $(`${category} .row.pt-1`).each((i, row) => {
            const $row = $(row);

            // Name of the card
            const name = $row.find("div.col-12 span").first().text().trim();

            // Buying price and quantity
            const buyingPrice = $row.find("h6:contains('Buying price')").siblings("span").text().trim();
            const buyingQty   = $row.find("h6:contains('Quantity')").first().siblings("span").text().trim();

            // Selling price and quantity
            const sellingPrice = $row.find("h6:contains('Selling price')").siblings("span").text().trim();
            const sellingQty   = $row.find("h6:contains('Quantity')").last().siblings("a, span").text().trim();

            results.push({
                    name,
                    buyingPrice: buyingPrice || null,
                    buyingQuantity: buyingQty || null,
                    sellingPrice: sellingPrice || null,
                    sellingQuantity: sellingQty || null,
                });
            }); 
    });

    const data = {
        timestamp: new Date().toISOString(),
        count: results.length,
        data: Array.from(results.entries()).map(([name, content]) => ({ name, ...content })),
    }

    console.log(`Scraped ${data.count} items.`);

    const json = JSON.stringify(data, null, 2);

    const sourcePath = `${RELATIVE_DATA_PATH}/source.json`;
    const backupPath = `${RELATIVE_DATA_PATH}/backup.json`;
    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, backupPath);
    }

    try {
      fs.writeFileSync(sourcePath, json, "utf8");
    } catch (err) {
      console.log('Error writing source.json:' + err.message)
    }

    console.log("Done.");
});