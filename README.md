# CSV E-Commerce Shop

A fully-featured e-commerce platform powered by CSV files for product and configuration management. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🛍️ Complete e-commerce functionality
- 📦 CSV-based product management (no database required)
- 🛒 Persistent shopping cart with localStorage
- 🔍 Advanced product search and filtering
- 📱 Fully responsive design
- 👨‍💼 Admin portal is mobile-friendly (works on phones/tablets)
- 🎨 Dynamic theming from CSV configuration
- 💳 WhatsApp checkout integration
- 📊 Product variants (colors, sizes)
- 🚚 Configurable shipping methods
- 💰 Discount codes and promotions
- 📧 Order notifications via WhatsApp/Email
- ⚡ Fast and lightweight
- 🎯 SEO-friendly

## Project Structure

```
/shop
├── /public
│   └── /data              # CSV data files
│       ├── config.csv     # Store configuration
│       ├── products.csv   # Product catalog
│       ├── categories.csv # Product categories
│       ├── shipping.csv   # Shipping rules
│       ├── discounts.csv  # Discount codes
│       ├── taxes.csv      # Tax configuration
│       └── seo.csv        # SEO metadata
├── /src
│   ├── /components        # React components
│   │   ├── /layout        # Header, Footer, Layout
│   │   ├── /product       # Product Card, Grid, Detail
│   │   ├── /cart          # Cart Sidebar, Cart Item
│   │   └── /common        # Search Bar, etc.
│   ├── /hooks             # Custom React hooks
│   ├── /pages             # Page components
│   ├── /services          # Business logic
│   ├── /types             # TypeScript definitions
│   ├── /utils             # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to deploy to any static hosting service.

## Configuration

### Store Settings

Edit `public/data/config.csv` to customize your store:

- Store name, logo, and branding colors
- Contact information (email, phone, WhatsApp)
- Tax and shipping settings
- Homepage banner content
- Social media links
- Feature toggles

### Products

Edit `public/data/products.csv` to manage your product catalog:

- Product details (name, price, description)
- Images (URLs to images)
- Stock quantities
- Variants (colors, sizes)
- Categories and tags
- SEO metadata

### Categories

Edit `public/data/categories.csv` to organize products:

- Category hierarchy
- Display order
- Category images and icons

### Shipping Methods

Edit `public/data/shipping.csv` to configure shipping:

- Different shipping options
- Price tiers based on order value
- Estimated delivery times
- Regional availability

### Discount Codes

Edit `public/data/discounts.csv` to create promotions:

- Percentage or fixed amount discounts
- Free shipping codes
- Minimum purchase requirements
- Usage limits and expiration dates

## CSV File Format

### Products CSV

```csv
product_id,product_name,price,description,stock_quantity,is_available,image_1,...
P001,Premium Headphones,299.99,High-quality wireless headphones,45,true,https://...,...
```

**Important:** 
- Use pipe symbol `|` to separate array values (colors, sizes, tags)
- Use proper image URLs (can be Unsplash, your own hosting, or relative paths)
- Boolean values should be `true` or `false`

### Config CSV

```csv
setting_key,setting_value,setting_type,description
store_name,Amazing Shop,text,Store display name
primary_color,#2563eb,color,Main brand color
tax_rate,8.5,number,Tax percentage
```

## Customization

### Colors

Update primary and secondary colors in `public/data/config.csv`:

```csv
primary_color,#2563eb,color,Main brand color
secondary_color,#7c3aed,color,Accent color
```

### Fonts and Styling

Edit `src/index.css` to customize global styles and Tailwind configuration.

### Components

All components are in `src/components/` and can be customized to match your brand.

## Order Processing

Orders are processed through WhatsApp by default:

1. Customer completes checkout
2. Order details are formatted into a WhatsApp message
3. Customer is redirected to WhatsApp with pre-filled message
4. You receive the order via WhatsApp
5. Order is also saved in browser localStorage for backup

To change to email notifications, update `order_notification_method` in `config.csv` to `email`.

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Framework preset: Vite
4. Deploy!

### Deploy to GitHub Pages

1. Install `gh-pages`: `npm install -D gh-pages`
2. Add to package.json scripts: `"deploy": "vite build && gh-pages -d dist"`
3. Run: `npm run deploy`

## Owner workflow: edit locally & deploy to Firebase

This repository includes convenience scripts so a shop owner can clone the repo, run the Admin + API locally to edit CSVs, and deploy the current build (including CSVs) to Firebase with a single command.

1. Clone & install
```powershell
git clone <repo-url>
cd shop
npm install
cd admin
npm install
cd ..
```

2. Start Admin + API (dev)
```powershell
# Starts local API (5174) and Admin dev server (3001)
npm run dev:admin
```

3. Edit data in Admin (http://localhost:3001)
- Use the Admin UI to edit config/products/categories/etc.
- The local API writes CSVs to `public/data/` immediately.

4. Deploy current files to Firebase
```powershell
# Build both, copy admin into shop dist and deploy hosting
npm run deploy:firebase
```

Or use the interactive helper (recommended) which prompts for project/site and deploys:
```powershell
npm run deploy:auto
```

Notes
- You must be logged into the Firebase CLI (`firebase login`) and have a default project selected (`firebase use --add`) before deploying.
- If you want to change build-time defaults for Admin, set env vars before building (examples below). But runtime overrides (query param, localStorage, or window.__ADMIN_RUNTIME__) work without rebuilding.
```powershell
$env:VITE_SHOP_URL='http://localhost:5173'; $env:VITE_API_URL='http://localhost:5174'; cd admin; npm run build
```

New option: start Admin + API and auto-deploy on Ctrl+C

If you'd like a single command that starts the Admin and API for editing and automatically builds & deploys when you finish (press Ctrl+C), use:
```powershell
npm run watch-and-deploy
```
This reads the default Firebase project from `.firebaserc` (or `FIREBASE_PROJECT` env var), starts Admin and API, and when you press Ctrl+C it builds the Shop/Admin, copies admin into `dist/admin`, and runs `firebase deploy --only hosting --project <project>`.

## Development

### Adding New Products

1. Open `public/data/products.csv`
2. Add a new row with product details
3. Save the file
4. Refresh your browser

### Adding New Features

The codebase is modular and well-organized:

- Add new pages in `src/pages/`
- Add new components in `src/components/`
- Add new hooks in `src/hooks/`
- Add business logic in `src/services/`

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management (cart)
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Zod** - Validation
- **PapaParse** - CSV parsing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting by route
- Lazy loading images
- CSV caching
- Optimized re-renders
- Small bundle size (~200KB gzipped)

## Security

- Input sanitization
- XSS protection
- Form validation
- Secure localStorage usage

## License

MIT License - feel free to use this for your projects!

## Support

For issues or questions:
- Check the CSV file formats
- Ensure all required fields are filled
- Check browser console for errors
- Verify image URLs are accessible

## Future Enhancements

Potential features to add:
- Multi-language support
- Customer reviews
- Wishlist functionality
- Product comparison
- Advanced analytics
- PWA support
- Payment gateway integration

## Credits

Built with modern web technologies and best practices. Images from Unsplash.
