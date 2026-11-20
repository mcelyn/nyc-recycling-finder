# ♻️ NYC Special Waste & Recycling Finder

A modern, accessible web app that helps New Yorkers locate drop-off facilities for special waste that **cannot** go into regular curbside recycling bins—including electronics, lithium-ion & household batteries, paints, solvents, nail polish, motor oil, and hazardous household waste.

Powered by live **NYC Open Data** and designed for seamless deployment on **Vercel**.

---

## 🌟 Key Features

- 🔍 **Everyday Language Search**: Search by common items like *"nail polish"*, *"e-bike battery"*, *"laptop"*, *"paint thinner"*, or *"old tv"* without needing to memorize municipal waste jargon.
- 📋 **Clear Disposal Guidance**: Instant breakdown showing whether the item is allowed in curbside recycling bins or standard trash, accompanied by step-by-step safety rules and NYC legal requirements.
- 🗺️ **Interactive NYC Map**: Leaflet-based map with custom markers for DSNY Special Waste sites (hazardous materials) and electronics drop-off partners across all 5 boroughs.
- 📍 **"Near Me" Geolocation**: Sorts drop-off locations by distance in miles from the user's current GPS location.
- 🏙️ **Borough Filtering**: One-click filtering for Manhattan, Brooklyn, Queens, Bronx, and Staten Island.
- 🧭 **1-Click Turn-by-Turn Navigation**: Deep-links to Google Maps and Apple Maps with pre-filled facility coordinates.
- ⚡ **Zero-API-Key Mapping**: Uses OpenStreetMap & Carto tiles—no credit cards or paid Google Maps billing setup required.

---

## 📦 Connected NYC Open Data Datasets

1. **[DSNY Special Waste Drop-Off Sites](https://data.cityofnewyork.us/Environment/DSNY-Special-Waste-Drop-off-Sites/242c-ru4i)** (`242c-ru4i`):
   Permanent municipal facilities in each borough accepting hazardous household products, motor oil, batteries, electronics, tires, and fluorescent bulbs.
2. **[Electronics Drop-Off Locations in NYC](https://data.cityofnewyork.us/Environment/Electronics-Drop-Off-Locations-in-NYC/wshr-5vic)** (`wshr-5vic`):
   100+ authorized retail partners (Best Buy, Staples, Goodwill, Salvation Army) and municipal e-waste hubs.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Map & Geodata**: [Leaflet](https://leafletjs.com/), [react-leaflet](https://react-leaflet.js.org/), and Carto Voyager raster tiles
- **Fuzzy Search**: [Fuse.js](https://www.fusejs.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Hosting**: [Vercel](https://vercel.com/) (Serverless & Edge-ready)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Sync or Refresh NYC Open Data
Run the normalization script to fetch the latest records directly from NYC Open Data APIs:
```bash
npm run sync-data
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to GitHub & Vercel

### Step 1: Commit and Push to GitHub
```bash
git add .
git commit -m "feat: initial prototype for NYC recycling finder"
# If you created a new GitHub repo:
# git remote add origin https://github.com/<your-username>/recycling-app.git
# git branch -M main
# git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New Project** and import your `recycling-app` GitHub repository.
3. Keep default settings (`Framework Preset: Next.js`).
4. Click **Deploy**. Your site will be live on a `*.vercel.app` domain in seconds!

---

## 📁 Project Architecture

```
recycling-app/
├── scripts/
│   └── sync-data.mjs            # Ingestion script fetching & normalizing NYC Open Data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── items/route.ts   # Serverless search endpoint for items
│   │   │   └── sites/route.ts   # Serverless endpoint for filtering drop-off sites
│   │   ├── globals.css          # Tailwind CSS + Leaflet styles
│   │   ├── layout.tsx           # SEO metadata & HTML frame
│   │   └── page.tsx             # Main client page (Search, guidance card, list & map)
│   ├── components/
│   │   ├── FilterBar.tsx        # Borough pills, location button, and counter
│   │   ├── ItemGuidanceCard.tsx # Detailed disposal instructions & rules card
│   │   ├── ItemSearch.tsx       # Fuzzy everyday language search input & autocomplete
│   │   ├── Map.tsx              # Dynamic Leaflet interactive map with custom pins
│   │   └── SiteCard.tsx         # Directory facility item card with navigation link
│   ├── data/
│   │   ├── items.json           # Everyday item taxonomy & disposal guidelines
│   │   └── sites.json           # Normalized 109+ NYC drop-off locations
│   ├── types/
│   │   └── recycling.ts         # TypeScript definitions
│   └── utils/
│       └── geo.ts               # Haversine distance & navigation deep-link helpers
```
