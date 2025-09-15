import * as cheerio from "cheerio";
import fs from "fs";
import { info, error } from "../lib/logger.js";

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

const RELATIVE_DATA_PATH = "./data";

/**
 * Scrapes data from the target website and saves it to source.json.
 * Creates a backup of the previous source.json as backup.json.
 */
export async function scrapeData() {
  // Fetch the content of the page
  const content = await fetch("https://cceh.trade");
  if (!content.ok) {
    throw new Error("Network response was not ok " + content.statusText);
  }
  const raw = await content.text();

  const results = [];

  // When the content is fetched, parse it
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

  const json = JSON.stringify(data, null, 2);

  const sourcePath = `${RELATIVE_DATA_PATH}/source.json`;
  const backupPath = `${RELATIVE_DATA_PATH}/backup.json`;
  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, backupPath);
  }

  try {
    fs.writeFileSync(sourcePath, json, "utf8");
  } catch (err) {
    error(`Error writing source.json: ${err.message}`);
  }

  info(`${data.count} resource prices have been retrieved.`);
}