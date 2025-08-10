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

## Deployment (GitHub Pages)
There are two common approaches. For both, set Vite base if deploying to a project repo (not user/organization site).

1) Configure Vite base path (if needed)
- In vite.config.ts, set base to your repo name:
```ts
export default defineConfig({
  base: "/<REPO_NAME>/",
  // ...rest of config
});
```

2) Deploy with GitHub Actions (recommended)
- Create .github/workflows/deploy.yml with a Pages workflow, for example:
```yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
- In your repo: Settings → Pages → Source: GitHub Actions.

3) Manual gh-pages branch (alternative)
- Build locally: `npm run build`
- Push the contents of dist/ to a gh-pages branch and enable Pages from that branch.

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
MIT ©oop7. See LICENSE if you add one.

## Acknowledgements
- NASA APOD: https://apod.nasa.gov/
- Icons: lucide-react
- UI: shadcn/ui + Radix Primitives
