import { getFileFromGitHub }  from "../lib/git.js";
import fs from "fs";
import { info, error } from "../lib/logger.js";

const FILE_PATH = "data/data.json";

export async function fetchData() {
    try {
        const data = await getFileFromGitHub(FILE_PATH);

        // Write the "backup.json" file locally, this will be used for reference in analysis
        fs.writeFileSync("./data/backup.json", data);

        info("Fetched latest data.json from GitHub.");
    } catch (err) {
        console.error(err);
        error("Failed to fetch data.json from GitHub:", err.message);
    }
}