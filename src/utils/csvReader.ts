/**
 * CSV Reader Utility for Shop Portal
 * Read-only CSV access without API calls
 */

interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse CSV content into structured data
 */
function parseCSV(content: string): ParsedCSV {
  const lines = content.trim().split('\n');
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV line handling quoted fields
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cols.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current);

    // Create row object
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = cols[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Read CSV file from public/data directory
 */
export async function readCSV(fileName: string): Promise<ParsedCSV> {
  try {
    const response = await fetch(`/data/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileName}`);
    }
    const content = await response.text();
    return parseCSV(content);
  } catch (error) {
    console.error(`Error reading CSV ${fileName}:`, error);
    return { headers: [], rows: [] };
  }
}
