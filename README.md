# NASA APOD Explorer

A sleek, modern, and responsive web app to explore NASA’s Astronomy Picture of the Day (APOD). Built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui. Features a beautiful in-app media viewer (no new windows), light/dark theme, favorites, and basic offline support.

![Hero](src/assets/hero-nebula.jpg)

## Features
- Daily APOD with title, explanation, and HD media
- In-app media viewer modal with zoom and download (no popups)
- Light/Dark theme toggle (persistent)
- Date browsing via date picker and range gallery
- Favorites stored in localStorage
- “Surprise me” random APOD
- Basic offline caching via service worker
- Accessible, responsive, and keyboard-friendly UI

## Tech Stack
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- @tanstack/react-query for data fetching/cache
- NASA APOD API (https://api.nasa.gov/planetary/apod)

## Live Demo
You can publish this project to GitHub Pages (instructions below). If deployed, add your live link here:
- Live: https://<your-username>.github.io/<your-repo>/

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
npm run dev
```
Then open http://localhost:5173

### NASA API Key (optional)
- The app works out-of-the-box with NASA’s DEMO_KEY (rate-limited).
- To use your own key, click the Settings (gear) icon in the header and paste your API key. It’s stored locally and used for subsequent requests.
- Get a key: https://api.nasa.gov/

## Scripts
```bash
# Start dev server
npm run dev

# Build for production (output in dist)
npm run build

# Preview the production build locally
npm run preview
```

## Project Structure
```
/
├── index.html
├── public/
│   └── sw.js                 # Service worker for basic offline caching
├── src/
│   ├── assets/
│   │   └── hero-nebula.jpg
│   ├── components/
│   │   ├── Header.tsx
│   │   └── apod/
│   │       ├── ApodHero.tsx
│   │       ├── ApodGallery.tsx
│   │       ├── ApodCard.tsx
│   │       └── DatePicker.tsx
│   ├── lib/
│   │   └── apod.ts           # API helpers + API key management (localStorage)
│   ├── pages/
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── index.css             # Design tokens & theme
│   ├── main.tsx              # App entry
│   └── App.tsx               # Providers & routes
├── tailwind.config.ts
└── vite.config.ts
```

## Deployment (Netlify)
Netlify makes deployment simple and fast. No Vite base path is needed (leave it default).

### Option A — Deploy via Netlify UI
1. Push your repo to GitHub/GitLab/Bitbucket
2. In Netlify, click “Add new site” → “Import an existing project”
3. Select your repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20 (Site settings → Build & deploy → Environment)
5. Deploy

### Option B — Deploy via Netlify CLI
- Install CLI: `npm i -g netlify-cli`
- Login: `netlify login`
- Init (first time): `netlify init`
- Build & deploy: `npm run build && netlify deploy --prod --dir=dist`

### SPA Routing & Caching
This repo includes `netlify.toml` to:
- Redirect all routes to `/index.html` (prevents 404 on refresh)
- Cache hashed assets aggressively
- Prevent caching of HTML and `sw.js`

### Environment / Secrets
- NASA API key entry is handled in-app via Settings and stored in localStorage (no build-time env needed).
- If you later add env vars, set them in Netlify → Site settings → Environment.

### Post-deploy checklist
- Deep links work (client-side routing fallback)
- Images/videos load; offline caching works (service worker)
- Theme toggle persists; Lighthouse scores are solid

## Accessibility
- Semantic HTML, labeled controls, aria-attributes for dialogs
- Keyboard navigation for key interactions
- High-contrast theming with Tailwind semantic tokens

## Privacy & Data
- No server-side storage. Favorites and API key live in your browser’s localStorage.
- NASA content courtesy of the APOD API. Respect their usage policies.

## Contributing
Issues and PRs are welcome! Please:
- Use descriptive titles and follow conventional commits when possible
- Keep PRs focused and small
- Adhere to existing code style

## License
MIT © Your Name. See LICENSE if you add one.

## Acknowledgements
- NASA APOD: https://apod.nasa.gov/
- Icons: lucide-react
- UI: shadcn/ui + Radix Primitives
