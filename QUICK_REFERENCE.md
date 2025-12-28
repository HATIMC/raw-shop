# 🚀 Quick Reference - Shop & Admin

## URLs

| Application | URL | Port | Purpose |
|-------------|-----|------|---------|
| **Shop** | http://localhost:5173 | 5173 | Customer-facing store |
| **Admin Portal** | http://localhost:3001 | 3001 | Management interface |

## Starting Applications

### Shop
```bash
cd /Users/chathiwh/learn/shop
npm run dev
```

### Admin Portal
```bash
cd /Users/chathiwh/learn/shop/admin
npm run dev
```

## Admin Login

**URL:** http://localhost:3001  
**Password:** `admin123`  
**Change Password:** `admin/src/store/authStore.ts`

## Admin Portal Navigation

| Section | Icon | Purpose |
|---------|------|---------|
| Dashboard | 📊 | Overview and stats |
| Config | ⚙️ | Store settings, colors, contact |
| Products | 📦 | Product catalog with images |
| Categories | 📁 | Category hierarchy |
| Shipping | 🚚 | Shipping methods |
| Discounts | 💰 | Discount codes |
| Taxes | 📄 | Tax rules |
| SEO | 🔍 | Meta tags |
| **Images** | 🖼️ | **Image manager** |

## Image Manager Features

✅ View all images with previews  
✅ See where each image is used  
✅ Config images overview (banner, logo, etc.)  
✅ Filter by type (Config, Products, Categories)  
✅ Image statistics  
✅ Click URLs to open full image  

## CSV File Locations

All CSV files in: `/Users/chathiwh/learn/shop/public/data/`

- `config.csv` - Store settings
- `products.csv` - Product catalog
- `categories.csv` - Categories
- `shipping.csv` - Shipping methods
- `discounts.csv` - Discount codes
- `taxes.csv` - Tax rules
- `seo.csv` - Meta tags

## Editing Workflow

1. **Open Admin** → http://localhost:3001
2. **Login** → Password: admin123
3. **Navigate** → Choose editor (Products, Config, etc.)
4. **View** → See current data with images
5. **Download CSV** → Click "Download CSV" button
6. **Replace File** → Put in `/public/data/`
7. **Reload Shop** → See changes at http://localhost:5173

## Image Upload Workflow

1. **Prepare Image** → Optimize/compress
2. **Upload** → Firebase Storage or `/public/images/`
3. **Copy URL** → Full image URL
4. **Open Admin** → Go to appropriate editor
5. **Edit CSV** → Paste URL in image field
6. **Download** → Save CSV file
7. **Replace** → Put in `/public/data/`
8. **Reload** → View in shop

## Key Settings in config.csv

| Setting | Purpose |
|---------|---------|
| `store_name` | Shop name |
| `primary_color` | Brand color |
| `secondary_color` | Accent color |
| `currency_code` | Currency (USD, EUR, etc.) |
| `currency_symbol` | Symbol ($, €, etc.) |
| `store_email` | Contact email |
| `whatsapp_number` | WhatsApp for orders |
| `banner_image` | Homepage banner |
| `store_logo` | Header logo |

## Commands

### Install Dependencies
```bash
# Shop
cd /Users/chathiwh/learn/shop && npm install

# Admin
cd /Users/chathiwh/learn/shop/admin && npm install
```

### Start Dev Servers
```bash
# Shop (Terminal 1)
cd /Users/chathiwh/learn/shop && npm run dev

# Admin (Terminal 2)
cd /Users/chathiwh/learn/shop/admin && npm run dev
```

### Build for Production
```bash
# Shop only (Admin stays local)
cd /Users/chathiwh/learn/shop
npm run build
# Deploy dist/ folder to Firebase
```

### Stop Servers
```bash
# Kill all Vite servers
pkill -f vite

# Or press Ctrl+C in terminal
```

## Deployment

| Application | Deploy? | Where? |
|-------------|---------|--------|
| **Shop** | ✅ YES | Firebase Hosting |
| **Admin Portal** | ❌ NO | Local only |

## Security

- **Admin Password:** Change from `admin123` immediately
- **Admin Portal:** NEVER deploy to production
- **CSV Backups:** Keep copies before editing
- **Image URLs:** Use HTTPS for security

## Common Tasks

### Add New Product
1. Admin → Products
2. Download products.csv
3. Add row with product data
4. Upload product images to Firebase
5. Add image URLs to CSV
6. Replace products.csv in /public/data/
7. Reload shop

### Change Store Colors
1. Admin → Config
2. Find `primary_color` and `secondary_color`
3. Click color picker or edit hex value
4. Download config.csv
5. Replace in /public/data/
6. Reload shop

### View All Images
1. Admin → Images (🖼️)
2. See all images with previews
3. Filter by type if needed
4. Click URLs to view full size

### Find Banner Image
1. Admin → Images
2. Click "Config" filter tab
3. Scroll to "Config Images Overview"
4. See `banner_image` with preview

## Tips

💡 **Keep both apps running** in separate terminals  
💡 **Use Image Manager** before uploading duplicates  
💡 **Test changes** in shop before deploying  
💡 **Backup CSV files** regularly  
💡 **Optimize images** before uploading (compress!)  
💡 **Use consistent** image dimensions  
💡 **Name images** descriptively  

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Admin won't load data | Start shop dev server first |
| Port in use | Kill processes: `pkill -f vite` |
| Can't login | Password: `admin123` |
| Images not showing | Check URL accessibility |
| Changes not visible | Reload shop browser |

## File Structure

```
/shop
├── public/
│   └── data/              # CSV files
│       ├── config.csv
│       ├── products.csv
│       └── ...
├── src/                   # Shop app
├── admin/                 # Admin portal
│   ├── src/
│   │   └── pages/
│   │       └── ImageManager.tsx  # 🖼️ Image viewer
│   └── README.md
├── README.md
└── ADMIN_PORTAL_GUIDE.md  # Full guide
```

## Need Help?

- **Full Guide:** `ADMIN_PORTAL_GUIDE.md`
- **Admin Docs:** `admin/README.md`
- **Shop Docs:** `README.md`
- **Quick Start:** `QUICK_START.md`
- **Technical:** `IMPLEMENTATION_SUMMARY.md`

---

**Quick Access URLs:**
- Shop: http://localhost:5173
- Admin: http://localhost:3001
- Password: `admin123`
