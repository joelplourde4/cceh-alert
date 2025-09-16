import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { compare, formatResults } from '../scripts/analyze.js';

describe('analyze', () => {

    // Load the backup file first
    const backupData = JSON.parse(fs.readFileSync("./tests/data/backup.json", "utf8"));

    // Then load the current source file
    const sourceData = JSON.parse(fs.readFileSync("./tests/data/source.json", "utf8"));

    it('should detect changes between backup and source', () => {
        const { changesFound, results } = compare(backupData, sourceData);

        const formattedResults = formatResults(results);

        expect(changesFound).toBe(true);
        expect(formattedResults).toContain("Ingénieur: (Buying Price) 60 -> N/A (decreased)");
        expect(formattedResults).toContain("Scribe: (Buying Price) 75 -> N/A (decreased)");
        expect(formattedResults).toContain("Scribe: (Buying Quantity) 0 -> 5 (increased)");
        expect(formattedResults).toContain("Scribe: (Selling Price) 100 -> 85 (decreased)");
    });
});