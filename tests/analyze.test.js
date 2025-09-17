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
        const splitResults = formattedResults.split('\n').filter(line => line.trim() !== '');

        expect(splitResults.length).toBe(8);

        expect(changesFound).toBe(true);
        expect(splitResults[0]).toBe("- Charpentier: (Selling Quantity) 21 (28) -> 15 (28) (decreased)");
        expect(splitResults[1]).toBe("- Forgeron: (Selling Price) 90 -> N/A (increased)");
        expect(splitResults[2]).toBe("- Forgeron: (Selling Quantity) 9 -> 0 (decreased) :money_with_wings:");
        expect(splitResults[3]).toBe("- Ingénieur: (Buying Price) 60 -> N/A (decreased)");
        expect(splitResults[4]).toBe("- Scribe: (Buying Price) 75 -> N/A (decreased)");
        expect(splitResults[5]).toBe("- Scribe: (Buying Quantity) 0 -> 5 (increased)");
        expect(splitResults[6]).toBe("- Scribe: (Selling Price) 100 -> 85 (decreased) :money_with_wings:");
        expect(splitResults[7]).toBe("- Archer: (Buying Price) 240 -> 290 (increased) :money_with_wings:");
    });
});