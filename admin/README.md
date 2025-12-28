# Shop Admin Portal

## 🚀 Quick Start

### Starting All Servers (Recommended)

**From shop root directory:**
```bash
# Start EVERYTHING at once (Shop + API + Admin)
npm run dev:all    # Shop (5173) + API (5174)
cd admin && npm run dev  # Admin (3001) in new terminal
```

**Or start individually:**
```bash
# Terminal 1: Shop + API Server
cd /Users/chathiwh/learn/shop
npm run dev:all

# Terminal 2: Admin Portal
cd /Users/chathiwh/learn/shop/admin
npm run dev
```

### Servers Overview
- **Shop:** http://localhost:5173 - Customer-facing storefront
- **API:** http://localhost:5174 - CSV save endpoint (auto-starts with shop)
- **Admin:** http://localhost:3001 - This admin portal (login: `admin123`)

## Overview
Admin portal for managing your CSV-driven e-commerce store locally. This portal provides a user-friendly interface to view and edit all store data without manually editing CSV files.

## Features

### 🔐 Authentication
- Simple password protection (default: `admin123`)
- Change password in `src/store/authStore.ts`
- Session persists in browser

### 📊 Dashboard
- Store statistics overview
- Quick links to all editors
- Data summary cards

### ⚙️ Store Configuration Editor
- Edit all store settings
- Visual preview of colors
- Contact information management
- Banner and branding settings

### 📦 Product Manager
- View all products with images
- Filter and search products
- See product details and variants
- Image URL management

### 📁 Category Manager
- Hierarchical category view
- Parent and subcategory relationships
- Category images preview
- Icon visualization

### 🚚 Shipping Methods
- Manage shipping options
- Edit prices and delivery times
- Configure minimum order values

### 💰 Discount Codes
- View active/expired codes
- Discount percentages and amounts
- Expiration date tracking

### 📄 Tax Configuration
- Regional tax rules
- Tax rate management
- Active/inactive status

### 🔍 SEO Manager
- Meta tags editor
- Open Graph settings
- Social media preview
- Character count for optimal SEO

### 🖼️ **Image Manager** (MOST IMPORTANT)
- **View all images** used in the store
- **Visual preview** of every image
- **See where each image is used** (config, products, categories, SEO)
- **Config images overview** - see banner, logo, etc.
- **Filter by usage** (all, config, products, categories)
- **Statistics** (total images, breakdown by type)
- **Usage tracking** - know which CSV file and field uses each image

- 📱 Mobile-friendly responsive admin UI (hamburger navigation on small screens)

## Installation

1. **Navigate to admin folder:**
   ```bash
   cd admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start admin portal:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Visit http://localhost:3001

5. **Login:**
   Enter password: `admin123`

## How to Use

### ✅ NEW: Auto-Save to Files!

#### Products
1. Navigate to **Products** page
2. Click **"➕ Add New Product"** or **"✏️ Edit"** on any product
3. Fill in form (category dropdown available!)
4. Click **Save** → Auto-saved to products.csv ✅
5. Delete with **🗑️** button (instant, no confirmation)

#### Categories
1. Navigate to **Categories** page
2. Click **"➕ Add New Category"** to create
3. Edit existing with **"✏️ Edit"** button
4. Set parent category from dropdown
5. Delete with **🗑️** button → Auto-saved ✅

#### Config Settings
1. Navigate to **Config** page
2. Click **"✏️ Edit"** on any setting
3. Change value (color picker for colors!)
4. Click **"✓ Save"** → Auto-saved instantly ✅
5. **Admin portal updates immediately** (colors, logo, favicon)
6. **Refresh shop page** (press F5 or Cmd/Ctrl+Shift+R) to see changes

**Note:** Theme colors (primary/secondary) update in admin instantly, but shop needs manual refresh to pick up changes from config.csv

### OLD Method (Not Needed)

1. **Login** to admin portal
2. **Navigate** to desired editor (Config, Products, etc.)
3. **View** current data in user-friendly format
4. **Edit** values directly in the interface
5. **Download CSV** button saves edited file (if API fails)I
4. **Backups created** automatically in `/public/data/backups/`
5. **Refresh shop** to see changes

### Editing CSV Data

1. **Login** to admin portal
2. **Navigate** to desired editor (Config, Products, etc.)
3. **View** current data in user-friendly format
4. **Edit** values directly in the interface
5. **Download CSV** button saves edited file
6. **Replace** the downloaded CSV in `../public/data/` folder
7. **Reload shop** to see changes

### Managing Images

#### View Images
1. Go to **Image Manager**
2. See all images with previews
3. Filter by type (Config, Products, Categories)
4. View usage details for each image

#### Upload New Images
1. **Prepare image** (optimize, resize)
2. **Upload to Firebase Storage** or place in `../public/images/`
3. **Copy image URL**
4. **Go to appropriate editor** (Products, Config, etc.)
5. **Edit CSV** and paste image URL
✅ **Auto-Save Enabled**
- Admin portal now **writes directly** to CSV files
- **Backup system** creates timestamped backups automatically
- **API server required** (starts with `npm run dev:all`)
- If API unavailable, falls back to download

⚠️ **Server Requirements**
- **Shop server** must be running (port 5173) - Admin reads CSVs from it
- **API server** must be running (port 5174) - Saves CSVs back to files
- **Admin server** runs separately (port 3001)
- Use `npm run dev:all` in shop root to start shop + API together

⚠️ **Theme Colors**
- **Primary & Secondary colors** from config.csv now work properly!
- Colors apply to buttons, links, and UI elements
- **Logo & Favicon** load dynamically from config URLs
- **Banner image** displays on homepage
- Refresh shop after changing theme settings

⚠️ **CSV Replacement Required (Fallback)**
- If API fails, admin will Usage
- Image Manager shows **where each image is used**
- View **Config Images Overview** for banner, logo, etc.
- See **all products** using each image
- Track **unused images** (future feature)

### Config Images Explained

The **Config Images Overview** shows you:
- **Banner image** - Homepage hero banner
- **Logo** - Store logo in header
- **Favicon** - Browser tab icon
- **Default OG Image** - Social media sharing image
- Any other images in config.csv

Each shows:
- Visual preview
- Setting key name
- Full image URL
- Quick link to open image

## Important Notes

⚠️ **CSV Replacement Required**
- Admin portal **reads** CSV files from shop
- After editing, **download CSV**
- **Manually replace** file in `../public/data/`
- This ensures version control and safety

⚠️ **Image Storage**
- Images stored in **Firebase Storage** or **public/images/**
- Admin portal **does not upload** images
- You must **manually upload** images first
- Then **paste URL** in CSV editor

⚠️ **Local Only**
- Admin portal runs **locally only**
- **NOT deployed** to Firebase
- Only shop app gets deployed
- Keep admin portal on your computer

⚠️ **Backup First**
- Always **backup CSV files** before editing
- Keep original files safe
- Test changes before deploying shop

## File Structure

```
/admin
├── sStart all servers:** `npm run dev:all` in shop root + `npm run dev` in admin folder
2. **Open shop** in one browser tab (http://localhost:5173)
3. **Open admin** in another tab (http://localhost:3001)
4. **Edit in admin** → Save → Refresh shop
5. **No manual CSV replacement** needed! ✅
6. **Check backups** in `/public/data/backups/` if needed # Store settings
│   │   ├── ProductsEditor.tsx     # Products with images
│   │   ├── CategoriesEditor.tsx   # Category hierarchy
│   │   ├── ShippingEditor.tsx     # Shipping methods
│   │   ├── DiscountsEditor.tsx    # Discount codes
│   │   ├── TaxesEditor.tsx        # Tax rules
│   │   ├── SEOEditor.tsx          # Meta tags
│   │   └── ImageManager.tsx       # Image viewer & manager
│   ├── services/
│   │   ├── csvService.ts          # CSV read/write
│   │   └── imageService.ts        # Image scanning
│   ├── store/
│   │   └── authStore.ts           # Authentication
│   ├── components/
│   │   └── Layout.tsx             # Admin layout
│   ├── App.tsx                    # Main app
│   └── main.tsx                   # Entry point
├── package.json
└── vite.config.ts
```

## Security

### Password Protection
- Default password: `admin123`
- Change in `src/store/authStore.ts`:
  ```typescript
  const ADMIN_PASSWORD = 'your-secure-password';
  ```

### Recommendations
- **Change default password** immediately
- Use **strong password**
- Only run **locally**, never deploy admin portal
- Keep **admin folder private**

## Tips

### Efficient Workflow
1. **Open shop** in one browser tab (http://localhost:5173)
2. **Open admin** in another tab (http://localhost:3001)
3. **Edit in admin** → Download CSV
4. **Replace CSV** in data folder: `npm run dev:all` in shop root
- Check shop is accessible at http://localhost:5173
- Check CSV file paths in `csvService.ts`
- Verify CSV files exist in `../public/data/`

**Can't save changes?**
- Make sure API server is running (port 5174)
- Check console for API errors
- Falls back to download if API unavailable
- Check file permissions in `/public/data/`

**Images not loading?**
- Check image URLs are accessible
- Verify URLs in CSV files
- Test image URL in browser first

**Theme colors not applying?**
- Check `primary_color` and `secondary_color` in config.csv
- Must be valid hex colors (#RRGGBB)
- Refresh shop after changing
- Clear browser cache if neededasy tracking

### Best Practices
- **Edit one CSV at a time**
- **Test changes** before deploying
- **Keep backups** of working CSV files
- **Document** custom changes
- **Use descriptive** image filenames

## Troubleshooting

**Can't see CSV data?**
- Make sure shop's dev server is running
- Check CSV file paths in `csvService.ts`
- Verify CSV files exist in `../public/data/`

**Images not loading?**
- Check image URLs are accessible
- Verify URLs in CSV files
- Test image URL in browser first

**Can't login?**
- Default password: `admin123`
- Check `authStore.ts` for password
- Clear browser cache/localStorage

## Future Enhancements

Potential features to add:
- [ ] Direct CSV editing (no download required)
- [ ] Image upload functionality
- [ ] Bulk operations
- [ ] Data validation
- [ ] Preview changes before saving
- [ ] Undo/redo functionality
- [ ] Search across all data
- [ ] Export/import backups

## Support

For issues or questions:
1. Check console for errors
2. Verify file paths
3. Ensure dependencies installed
4. Test in different browser

---

**Remember:** Admin portal is for local use only. Only deploy the shop app to Firebase!

## Deploy admin as a downloadable site (Firebase)

You can host the built Admin on Firebase so users can download the static files and run the Admin locally (pointing at their local Shop + API). The Admin supports runtime overrides so you don't need to rebuild it for local usage.

Quick steps:

1. Build Shop + Admin

```powershell
# Build the Shop (root)
npm install
npm run build

# Build the Admin (set defaults for local usage)
$env:VITE_SHOP_URL='http://localhost:5173'; $env:VITE_API_URL='http://localhost:5174'; cd admin; npm install; npm run build; cd ..
```

2. Copy Admin into Shop `dist` (so Firebase serves both)

```powershell
node scripts/copy-admin-dist.js
```

3. Configure Firebase (a sample `firebase.json` is included in the repo)

- `firebase.json` will serve the Shop at `/` and the Admin at `/admin`.
- Initialize hosting if needed: `firebase init hosting` and choose the existing project.

4. Deploy to Firebase

```powershell
firebase deploy --only hosting
```

How users run the downloaded Admin locally

- The built Admin can be downloaded from your Firebase site (e.g. `https://your-site.web.app/admin/`).
- To run it locally (serve the files with a static server), then point it at a local Shop + API, you can use one of these runtime overrides (no rebuild required):
  - Query params: `http://localhost:8080/?shop_url=http://localhost:5173&api_url=http://localhost:5174`
  - localStorage:
    - `localStorage.setItem('ADMIN_SHOP_URL','http://localhost:5173')`
    - `localStorage.setItem('ADMIN_API_URL','http://localhost:5174')`
  - Global script (add into `index.html` before the bundle):

```html
<script>
  window.__ADMIN_RUNTIME__ = { SHOP_URL: 'http://localhost:5173', API_URL: 'http://localhost:5174' };
</script>
```

- Start your local servers before using Admin:
  - `npm run dev:all` (starts Shop + local API)
  - While API runs at `http://localhost:5174`, Admin can save CSVs/images to your local files.

Notes

- Admin will fall back to downloading CSVs if API is unreachable.
- Uploaded images are stored by the API server (local filesystem by default). To make uploads available in production, host the API with persistent storage (Cloud Run + Cloud Storage).
