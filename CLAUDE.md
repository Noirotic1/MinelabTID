# Minelab TID — Claude Code Project Brief

## What This Is
A Progressive Web App (PWA) for metal detectorists — a field-ready Target ID reference tool that works offline on iOS and Android as a home screen app. The app is a single-file static site (no build step, no framework, no dependencies).

## Developer
**Mike Noirot**
Email: noirot@gmail.com
Role: App developer and metal detecting enthusiast
Contact for: bug reports, feedback, new detector requests, data corrections

---

## Project Files

| File | Purpose |
|------|---------|
| `index.html` | Entire app — HTML, CSS, and JS in one file |
| `manifest.json` | PWA manifest (name, icons, display mode) |
| `sw.js` | Service worker — caches all files for offline use |
| `icon-192.png` | Home screen icon (192×192) |
| `icon-512.png` | Splash/install icon (512×512) |

---

## Running Locally

```bash
# Option 1 — Python (no install needed)
python3 -m http.server 8080

# Option 2 — Node serve
npx serve .

# Option 3 — Ask Claude Code to start a server
```

Access on phone via `http://YOUR-LAN-IP:8080` (same Wi-Fi network).
Service worker (offline caching) requires HTTPS — works automatically once hosted on Netlify or behind a Cloudflare tunnel.

---

## Architecture

**Single-file app** — all CSS and JS live inside `index.html`. No build step. No npm. No framework. Edit and refresh.

**Data structure** — all detector TID data lives in the `DETECTORS` object at the top of the `<script>` block. Each detector has:
```javascript
{
  label: 'Display name',
  ctx: false,           // true only for CTX 3030 (2D FE/CO system)
  scaleLabel: '...',    // shown in header subtitle
  scaleTicks: [...],    // 6 labels for the gradient scale bar
  targets: [
    { tid: "77–80", item: "Clad Dime (Roosevelt)", cat: "coin", note: "..." },
    ...
  ]
}
```

**Categories** — `coin`, `gold`, `jewelry`, `relic`, `trash`, `iron`

**State persistence** — all user preferences saved to `localStorage`:
- `themeMode` — `'night'` | `'day'` | `'auto'`
- `detectorKey` — `'manticore'` | `'equinox900'` | `'equinox800'` | `'ctx3030'`
- `fontSize` — `'sm'` | `'md'` | `'lg'` | `'xl'`
- `discShown` — `'true'` | `'false'`

---

## Current Detectors

| Key | Detector | TID Scale | Notes |
|-----|----------|-----------|-------|
| `manticore` | Minelab Manticore | −19 to 99 | Multi-IQ+ |
| `equinox900` | Minelab Equinox 900 | −19 to 99 | Multi-IQ+ |
| `equinox800` | Minelab Equinox 800 | −9 to 40 | Multi-IQ |
| `ctx3030` | Minelab CTX 3030 | FE 0–35 / CO 1–50 | 2D system — special handling |

### CTX 3030 Special Handling
The CTX 3030 uses a 2D FE/CO coordinate system rather than a single number. In the app:
- `ctx: true` flag triggers CTX-specific rendering
- TID column label changes from "TID" to "FE/CO"
- A warning banner appears in the header explaining the 2D system
- TID values are formatted as `FE/CO` (e.g., `12/43–45`)
- The range search parser handles both FE and CO segments

---

## Features

### Theme System
- Night (dark), Day (high-contrast light for outdoor sunlight), Auto (follows phone system setting)
- All colors use CSS custom properties on `:root` and `[data-theme="day"]`
- Header, cards, settings drawer, footer all theme-aware
- System preference changes update live when in Auto mode

### Font Size
- 4 sizes: Small (default), Medium, Large, XL
- Card fonts (TID values, item names, notes, badges, filter buttons) scale via CSS vars
- Header and chrome fonts are fixed (already bumped up for readability)
- Controlled by `data-fsize` attribute on `<html>`

### Settings Drawer
- Opens from ⚙ button in header
- Swipe-down to dismiss (detects downward drag when scrolled to top, 80px threshold)
- Tap overlay to dismiss
- Sections: Detector, Display Mode, Font Size, Show Disclaimer toggle, Credits button (at bottom)

### Credits Modal
- Opens from Credits button at bottom of settings
- Shows developer info (Mike Noirot, noirot@gmail.com) with mailto link
- Per-detector sourced references with clickable URLs
- Version stamp

### Search
- Text match on item name and raw TID string
- **Range-aware numeric search** — typing `77` surfaces any target whose TID range includes 77 (e.g., `77–80`, `72–78`)
- Handles negative ranges (iron zone), CTX FE/CO format, warning-symbol entries

### Disclaimer Footer
- Fixed to bottom with dismiss (✕) button
- Dismissed state saved to localStorage
- Toggle in settings to re-enable
- List bottom padding adjusts automatically when footer is hidden

---

## Data Sources (by detector)

### Manticore
- Big Boys Hobbies 2025 Manticore Coin Chart: https://bigboyshobbies.net/blogs/default-blog/minelab-manticore-coin-chart-2025
- Big Boys Hobbies Manticore TID List 2025: https://bigboyshobbies.net/blogs/default-blog/minelab-manticore-target-id-list-2025
- DetectorProspector Manticore VDI Chart (BigSky): https://www.detectorprospector.com/topic/21367-manticore-v-d-i-chart/
- FindMall 900/Manticore VDI Thread: https://www.findmall.com/threads/for-those-interested-900-manticore-vdi-chart.365093/

### Equinox 900
- TreasureNet Equinox 900 VDI Thread: https://www.treasurenet.com/threads/equinox-900-vdi-chart.682499/
- Kellyco Detectors Equinox 900 Guide: https://www.kellycodetectors.com/minelab-equinox-900-metal-detector/
- FindMall 900/Manticore VDI Thread (shared with Manticore above)

### Equinox 800
- Big Boys Hobbies Equinox ID Chart: https://bigboyshobbies.net/blogs/default-blog/minelab-equinox-metal-detector-id-chart-numbers-quick-reference-guide
- DetectorProspector Equinox VDI Chart: https://www.detectorprospector.com/topic/5472-another-equinox-vdi-chart/
- DetectorProspector US Gold Coins EQX 800: https://www.detectorprospector.com/topic/10972-us-gold-coins-and-the-eqx-800/
- History Detector Equinox 800 VDI Numbers: https://www.historydetector.com/minelab-equinox/minelab-equinox-800-vdi-numbers/

### CTX 3030
- Big Boys Hobbies CTX 3030 Exclusive Guide: https://bigboyshobbies.net/pages/minelab-ctx-3030-exclusive-guide
- Minelab CTX 3030 Instruction Manual: https://www.manualslib.com/manual/742490/Minelab-Ctx3030.html?page=15
- MetalDetectingWorld CTX Tone ID Map: https://www.metaldetectingworld.com/ctx3030_tone_id_map.shtml
- FindMall CTX 3030 Target ID Chart (4 Modes): https://www.findmall.com/threads/ctx3030-target-id-chart-for-4-modes.362026/

---

## Known Field-Tested Corrections
- **Manticore clad dime**: TID 77–80 (field-tested by Mike Noirot; published charts showed 80–85, which appears to conflate it with copper pennies)

---

## Adding a New Detector
1. Add a new entry to the `DETECTORS` object in `index.html`
2. Add a new `.dopt` button in the settings drawer HTML (detector grid is 2×2 — add a third row if needed)
3. If the detector uses a 2D FE/CO system like the CTX 3030, set `ctx: true`
4. Add source citations to the Credits modal HTML section
5. Add source URLs to this CLAUDE.md

## Deploying Updates
1. Edit `index.html` locally
2. Test via local server on phone
3. Upload to hosting (Netlify drop or GitHub Pages)
4. Update service worker cache version in `sw.js` if adding new files:
   ```javascript
   const CACHE_NAME = 'minelab-tid-v2'; // bump version number
   ```

---

## Version History
| Version | Date | Changes |
|---------|------|---------|
| v1.0 | May 2026 | Manticore only, basic TID chart |
| v1.5 | May 2026 | Added Equinox 800, day/night/auto theme, font size, swipe dismiss |
| v2.0 | May 2026 | Added Equinox 900 + CTX 3030, Credits modal, range-aware search, source citations, renamed to Minelab TID |
