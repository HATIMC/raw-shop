import Papa from 'papaparse';


// Runtime config is resolved dynamically via getRuntimeConfig() so build artifacts can be
// downloaded and pointed at any local or remote shop/API using query params, localStorage
// or a global window.__ADMIN_RUNTIME__ object.

export interface CSVData {
  headers: string[];
  rows: any[];
}

export function getRuntimeConfig() {
  const globalCfg = (window as any).__ADMIN_RUNTIME__ || {};
  const params = new URLSearchParams(window.location.search);
  const lsShop = localStorage.getItem('ADMIN_SHOP_URL');
  const lsApi = localStorage.getItem('ADMIN_API_URL');

  const shop = params.get('shop_url') || lsShop || globalCfg.SHOP_URL || (import.meta as any).env?.VITE_SHOP_URL || 'http://localhost:5173';
  const api = params.get('api_url') || lsApi || globalCfg.API_URL || (import.meta as any).env?.VITE_API_URL || 'http://localhost:5174';

  return {
    SHOP_URL: shop,
    API_URL: api,
    DATA_DIR: `${shop}/data`,
  };
}

/**
 * Replace absolute local image URLs (e.g. http://localhost:5173/images/...) with relative paths (/images/...) so
 * deployed sites don't keep pointing to localhost. This is intentionally conservative: it only rewrites image URLs
 * hosted on local/private addresses or on the currently configured SHOP/API host.
 */
function sanitizeImagePaths(rows: any[]): any[] {
  const { SHOP_URL, API_URL } = getRuntimeConfig();

  let shopHost: string | null = null;
  let apiHost: string | null = null;
  try { shopHost = new URL(SHOP_URL).host; } catch (e) { /* ignore */ }
  try { apiHost = new URL(API_URL).host; } catch (e) { /* ignore */ }

  return rows.map((row) => {
    const newRow: any = { ...row };

    for (const k of Object.keys(newRow)) {
      let v = newRow[k];
      if (!v || typeof v !== 'string') continue;
      v = v.trim();

      // Ensure a path like "images/foo.png" becomes "/images/foo.png"
      if (/^images\//i.test(v)) {
        v = '/' + v;
      }

      // Match absolute URLs that contain an /images/ path
      const m = v.match(/https?:\/\/([^\/\s"']+)(\/images\/[\S^\s"']+)/i);
      if (m) {
        const host = m[1];
        const path = m[2];
        const isLocalHost = /^(localhost|127\.|10\.|192\.168\.|172\.)/i.test(host) || host === shopHost || host === apiHost;
        if (isLocalHost) {
          v = path; // Convert to relative path
        }
      }

      newRow[k] = v;
    }

    return newRow;
  });
}

/**
 * Read CSV file from the shop's public/data directory
 */
export async function readCSV(fileName: string): Promise<CSVData> {
  try {
    const { DATA_DIR } = getRuntimeConfig();
    const response = await fetch(`${DATA_DIR}/${fileName}`);
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    return {
      headers: result.meta.fields || [],
      rows: result.data,
    };
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    throw error;
  }
}

/**
 * Save CSV file directly to the file system via backend API
 */
export async function saveCSV(fileName: string, data: any[]): Promise<void> {
  const { API_URL } = getRuntimeConfig();
  // Sanitize image paths before saving so saved CSVs don't reference localhost URLs
  const safeData = sanitizeImagePaths(data);
  
  const csv = Papa.unparse(safeData, {
    quotes: false, // Let Papa decide when to quote
    quoteChar: '"',
    escapeChar: '"',
    skipEmptyLines: true,
  });
  
  try {
    const response = await fetch(`${API_URL}/api/save-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, csvContent: csv }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ CSV saved:', result.message);
      
      // Show reminder for config.csv changes
      if (fileName === 'config.csv') {
        alert(`✅ ${fileName} saved successfully!\n\n⚠️ Reminder: Refresh your Shop page (${getRuntimeConfig().SHOP_URL}) to see theme/banner/favicon changes!`);
      } else {
        alert(`✅ ${fileName} saved successfully!`);
      }
    } else {
      throw new Error('API call failed');
    }
  } catch (error) {
    console.error('Error saving CSV:', error);
    // Fallback to download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('⚠️ API not available. CSV downloaded instead. Please replace manually.');
  }
}

/**
 * Write CSV with custom headers (for orders.csv with specific column order)
 */
export async function writeCSV(fileName: string, rows: any[], headers: string[]): Promise<void> {
  const { API_URL } = getRuntimeConfig();
  // Sanitize rows in case they include local/absolute image URLs
  const safeRows = sanitizeImagePaths(rows);
  const csv = Papa.unparse({ fields: headers, data: safeRows }, {
    quotes: false, // Let Papa decide when to quote
    quoteChar: '"',
    escapeChar: '"',
    skipEmptyLines: true,
  });
  
  try {
    const response = await fetch(`${API_URL}/api/save-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, csvContent: csv }),
    });
    
    if (!response.ok) {
      throw new Error('API call failed');
    }
    
    console.log(`✅ ${fileName} saved successfully`);
  } catch (error) {
    console.error('Error saving CSV:', error);
    throw error;
  }
}

/**
 * Legacy download function
 */
export function downloadCSV(fileName: string, data: any[]): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get all CSV files list
 */
export function getCSVFiles(): string[] {
  return [
    'config.csv',
    'products.csv',
    'categories.csv',
    'shipping.csv',
    'discounts.csv',
    'taxes.csv',
    'seo.csv',
  ];
}
