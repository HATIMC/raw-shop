import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5174;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static images
const imagesPath = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath, { recursive: true });
}
app.use('/images', express.static(imagesPath, {
  setHeaders: (res /* , path */) => {
    // Match the Firebase hosting cache policy for images used in production
    res.set('Cache-Control', 'public, max-age=0, s-maxage=3600, must-revalidate');
  }
}));

// Serve data files with a short cache window for quick edits during development
const dataPath = path.join(__dirname, 'public', 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}
app.use('/data', express.static(dataPath, {
  setHeaders: (res /* , path */) => {
    res.set('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate');
  }
}));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Save CSV endpoint
app.post('/api/save-csv', (req, res) => {
  try {
    const { fileName, csvContent } = req.body;
    
    if (!fileName || !csvContent) {
      return res.status(400).json({ error: 'fileName and csvContent are required' });
    }

    // Security: only allow CSV files in the data directory
    const allowedFiles = [
      'config.csv',
      'products.csv', 
      'categories.csv',
      'shipping.csv',
      'discounts.csv',
      'taxes.csv',
      'seo.csv',
      'orders.csv'
    ];

    if (!allowedFiles.includes(fileName)) {
      return res.status(403).json({ error: 'Unauthorized file' });
    }

    const filePath = path.join(__dirname, 'public', 'data', fileName);
    
    // Create backup
    const backupPath = path.join(__dirname, 'public', 'data', 'backups');
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupPath, `${fileName}.${timestamp}.bak`);
    
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupFile);
    }

    // Normalize absolute image URLs that point to local/private address spaces
    // (e.g. http://localhost:5173/images/..., http://127.0.0.1:5174/images/...) to relative paths (/images/...) so
    // deployed sites don't embed host-specific links that point at localhost.
    let sanitizedContent = csvContent;
    const localImageRegex = /https?:\/\/(?:localhost|127\.(?:\d+\.){2}\d+|10\.(?:\d+\.){2}\d+|192\.168\.(?:\d+\.)\d+|172\.(?:\d+\.){2}\d+)(?::\d+)?(\/images\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%-]+)/gi;
    if (localImageRegex.test(sanitizedContent)) {
      sanitizedContent = sanitizedContent.replace(localImageRegex, (_match, p1) => p1);
      console.log('🔧 Normalized local image URLs to relative paths in CSV before saving');
    }

    // Write new content
    fs.writeFileSync(filePath, sanitizedContent, 'utf8');
    
    console.log(`✅ Saved ${fileName} (backup: ${path.basename(backupFile)})`);
    
    res.json({ 
      success: true, 
      message: `${fileName} saved successfully`,
      backup: path.basename(backupFile)
    });
  } catch (error) {
    console.error('Error saving CSV:', error);
    res.status(500).json({ error: 'Failed to save CSV file', details: error.message });
  }
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Use a relative path so deployed site can reference the image at /images/<file>
    const imageUrl = `/images/${req.file.filename}`;
    // Also include an absolute local URL (protocol + host) so Admin running locally can fetch the image directly from the API
    const localUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
    console.log(`✅ Image uploaded: ${req.file.filename}`);
    console.log(`   → local: ${localUrl}`);
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      localUrl: localUrl,
      fileName: req.file.filename,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CSV API server running' });
});

// Add order endpoint
app.post('/api/add-order', async (req, res) => {
  try {
    const { order } = req.body;
    const csvPath = path.join(__dirname, 'public', 'data', 'orders.csv');
    
    // Read existing CSV
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Create new order row with userId as first column
    const itemsJson = JSON.stringify(order.items);
    const newRow = [
      order.userId || '',
      order.orderId,
      order.orderDate,
      order.customer.firstName,
      order.customer.lastName,
      order.customer.email || '',
      order.customer.phone,
      `"${(order.shippingAddress.address1 || '').replace(/"/g, '""')}"`, // Quote shipping address
      `"${itemsJson.replace(/"/g, '""')}"`,
      order.subtotal,
      order.tax,
      order.shipping,
      order.discount,
      order.total,
      order.shippingMethod.shippingName,
      order.paymentMethod,
      order.orderNotes ? `"${order.orderNotes.replace(/"/g, '""')}"` : '',
      order.status,
      'pending',
      '',
      order.discountCode || ''
    ].join(',');
    
    lines.push(newRow);
    fs.writeFileSync(csvPath, lines.join('\n'));
    
    console.log(`✅ Order added: ${order.orderId} for user: ${order.userId}`);
    res.json({ success: true, message: 'Order saved successfully' });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ error: 'Failed to add order', details: error.message });
  }
});

// Get user orders endpoint
app.get('/api/orders', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const csvPath = path.join(__dirname, 'public', 'data', 'orders.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.json([]);
    }
    
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length <= 1) {
      return res.json([]);
    }
    
    const headers = lines[0].split(',');
    const orders = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Parse CSV line handling quoted fields
      const cols = [];
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
      
      // Filter by userId (first column)
      if (cols[0] === userId) {
        const order = {
          user_id: cols[0],
          order_id: cols[1],
          order_date: cols[2],
          customer_first_name: cols[3],
          customer_last_name: cols[4],
          customer_email: cols[5],
          customer_phone: cols[6],
          shipping_address: cols[7],
          items_json: cols[8],
          subtotal: cols[9],
          tax: cols[10],
          shipping: cols[11],
          discount: cols[12],
          total: cols[13],
          shipping_method: cols[14],
          payment_method: cols[15],
          order_notes: cols[16],
          status: cols[17],
          admin_status: cols[18],
          admin_comment: cols[19],
          discount_code: cols[20]
        };
        orders.push(order);
      }
    }
    
    console.log(`📦 Fetched ${orders.length} orders for user: ${userId}`);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// Update order status endpoint
app.post('/api/update-order-status', async (req, res) => {
  try {
    const { orderId, status, comment } = req.body;
    const csvPath = path.join(__dirname, 'public', 'data', 'orders.csv');
    
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Update the order row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Parse CSV line properly handling quoted fields
      const cols = [];
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
      
      // Check if this is the order to update
      if (cols[1] === orderId) { // cols[1] is order_id
        cols[18] = status; // admin_status column
        cols[19] = comment || ''; // admin_comment column (no quotes, already parsed)
        
        // Rebuild the line with proper quoting
        const newLine = cols.map((col, idx) => {
          // Fields that need quoting: items_json (8), order_notes (16), admin_comment (19)
          if (idx === 8 || idx === 16 || idx === 19) {
            // If field has content and doesn't start with quote, add quotes
            if (col && !col.startsWith('"')) {
              return `"${col.replace(/"/g, '""')}"`;
            }
            // If already quoted or empty, return as is
            return col;
          }
          return col;
        }).join(',');
        
        lines[i] = newLine;
        break;
      }
    }
    
    fs.writeFileSync(csvPath, lines.join('\n'));
    
    console.log(`✅ Order status updated: ${orderId} -> ${status}`);
    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
});

// Delete order endpoint
app.delete('/api/delete-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    const csvPath = path.join(__dirname, 'public', 'data', 'orders.csv');
    
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Filter out the order to delete
    const header = lines[0];
    const filteredLines = [header];
    
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols[1] !== orderId) { // Keep all orders except the one to delete
        filteredLines.push(lines[i]);
      }
    }
    
    fs.writeFileSync(csvPath, filteredLines.join('\n'));
    
    console.log(`🗑️  Order deleted: ${orderId}`);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 CSV API Server running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${path.join(__dirname, 'public', 'data')}`);
  console.log(`💾 Backups stored in: ${path.join(__dirname, 'public', 'data', 'backups')}\n`);
});
