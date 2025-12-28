# 🚀 START SERVERS - Quick Guide

## Option 1: Start Everything at Once (Recommended)

### Terminal 1: Shop + API Server
```bash
cd /Users/chathiwh/learn/shop
npm run dev:all
```
This starts:
- **Shop:** http://localhost:5173 ✅
- **API:** http://localhost:5174 ✅

### Terminal 2: Admin Portal
```bash
cd /Users/chathiwh/learn/shop/admin
npm run dev
```
This starts:
- **Admin:** http://localhost:3001 ✅

---

## Option 2: Start Individually

### Terminal 1: Shop Only
```bash
cd /Users/chathiwh/learn/shop
npm run dev
```

### Terminal 2: API Server
```bash
cd /Users/chathiwh/learn/shop
npm run dev:api
```

### Terminal 3: Admin Portal
```bash
cd /Users/chathiwh/learn/shop/admin
npm run dev
```

---

## Quick Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| 🛍️ Shop | http://localhost:5173 | Customer storefront |
| 🔧 API | http://localhost:5174 | CSV save endpoint |
| 👨‍💼 Admin | http://localhost:3001 | Admin portal |

**Admin Login:** `admin123`

---

## What Each Server Does

### Shop Server (5173)
- Serves the customer-facing e-commerce site
- Reads CSV files from `/public/data/`
- Displays products, categories, etc.
- **Must be running** for admin to read CSVs

### API Server (5174)
- Provides CSV save endpoint
- Writes changes from admin back to files
- Creates automatic backups
- **Must be running** for admin auto-save

### Admin Portal (3001)
- Management interface
- Fetches CSVs from Shop (5173)
- Saves CSVs via API (5174)
- Password protected

Note: The admin portal is responsive and mobile-friendly. On small screens use the hamburger menu (top-left) to open navigation.

---

## Typical Workflow

1. **Start servers** (both terminals above)
2. **Open shop** → http://localhost:5173 (see customer view)
3. **Open admin** → http://localhost:3001 (login: admin123)
4. **Edit data** in admin (products, categories, config)
5. **Save** → Auto-saves to files ✅
6. **Refresh shop** → See changes immediately!

---

## Troubleshooting

**Port already in use?**
```bash
# Kill process on specific port
lsof -ti:5173 | xargs kill -9  # Shop
lsof -ti:5174 | xargs kill -9  # API
lsof -ti:3001 | xargs kill -9  # Admin
```

**Can't see data in admin?**
- Make sure shop server (5173) is running
- Admin reads CSVs from shop server

**Can't save in admin?**
- Make sure API server (5174) is running
- Check console for errors
- Falls back to download if API fails

**npm run dev:all not working?**
- Make sure you're in `/Users/chathiwh/learn/shop` (not admin folder)
- Run `npm install` first
- Check `package.json` has `dev:all` script

---

## Stop All Servers

Press `Ctrl + C` in each terminal window

Or kill all at once:
```bash
lsof -ti:5173,5174,3001 | xargs kill -9
```

---

## First Time Setup

If you haven't installed dependencies yet:

```bash
# Install shop dependencies
cd /Users/chathiwh/learn/shop
npm install

# Install admin dependencies
cd /Users/chathiwh/learn/shop/admin
npm install
```

Then follow **Option 1** above to start servers.

---

**Ready to go! 🎉**
