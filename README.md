# V60 Coffee Journal ☕

A mobile-first coffee journal for tracking James Hoffman's V60 brews. Built with React + Vite. No backend — data lives in your browser's `localStorage`, with full export/import support.

## Features

- **Brew timer** — guided step-by-step timer with an SVG progress ring, pour cues, and step indicators
- **Recipe reference** — Hoffman's full V60 method, ratio card, and grind guide
- **Log a brew** — dose, water, temp, drawdown time, taste profile sliders, flavour chips, star rating, notes
- **Journal** — all your brews with stats (total, avg rating, beans tried)
- **Export / Import** — download your journal as JSON, import it back on any device
- Dark mode, safe-area insets, no zoom on iOS inputs

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm (included with Node)

### Run locally

```bash
git clone https://github.com/YOUR_USERNAME/v60-coffee-journal.git
cd v60-coffee-journal
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
# Output in dist/
```

---

## Deploy to GitHub Pages

### One-time setup

1. **Create a GitHub repo** — e.g. `v60-coffee-journal`.

2. **Check `vite.config.js`** — the `base` must match your repo name exactly:
   ```js
   base: '/v60-coffee-journal/',
   ```
   If your repo has a different name, update this value.

3. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/v60-coffee-journal.git
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - Go to your repo → **Settings → Pages**
   - Under *Source*, choose **GitHub Actions**
   - Save

5. Done. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.


**Live URL:**
```
https://YOUR_USERNAME.github.io/v60-coffee-journal/
```

### Future updates

```bash
git add .
git commit -m "Your message"
git push
```

GitHub Actions handles the rest automatically.

---
```jsx
<a
  href="https://www.buymeacoffee.com/yourname"
  target="_blank"
  rel="noopener noreferrer"
  className={styles.bmc}
>
  ☕ Buy me a coffee
</a>
```

4. Add the style to `src/App.module.css`:

```css
.bmc {
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--c500);
  text-decoration: none;
  font-weight: 500;
}
.bmc:hover { color: var(--c700); }
```

---

## Project structure

```
v60-coffee-journal/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── BrewTimer.jsx / .module.css   ← guided brew timer
│   │   ├── BrewGuide.jsx / .module.css   ← recipe reference
│   │   ├── LogForm.jsx   / .module.css   ← new entry form
│   │   ├── EntryCard.jsx / .module.css   ← individual entry
│   │   └── Journal.jsx   / .module.css   ← journal + export/import
│   ├── hooks/
│   │   └── useJournal.js                 ← localStorage + export/import logic
│   ├── App.jsx / App.module.css          ← bottom nav shell
│   ├── index.css                         ← global tokens + base styles
│   └── main.jsx
├── .github/workflows/deploy.yml
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Customising

| What | Where |
|------|-------|
| Coffee ratio & recipe steps | `src/components/BrewGuide.jsx` |
| Timer step durations & cues | `src/components/BrewTimer.jsx` — edit the `STEPS` array |
| Flavour chips | `src/components/LogForm.jsx` — edit `FLAVORS` array |
| Colours & design tokens | `src/index.css` — CSS custom properties |

## License

MIT
