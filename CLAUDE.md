# Target ID — Claude Code Project Brief

## What This Is
A Progressive Web App (PWA) for metal detectorists — a field-ready Target ID reference tool that works offline on iOS and Android as a home screen app. The app is a single-file static site (no build step, no framework, no dependencies). Free and ad-free; supported by community donations via Ko-fi.

## Developer
**Mike Noirot**
Email: noirot@gmail.com
Ko-fi: https://ko-fi.com/noirot
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
| `icon-maskable-192.png` | Android maskable icon (art padded to safe zone) |
| `icon-maskable-512.png` | Android maskable icon (art padded to safe zone) |
| `CLAUDE.md` | This file — project brief for Claude Code |
| `CLAUDE.old` | Previous version of CLAUDE.md |

---

## Hosting & Deployment

**Live URL:** https://targetid.noirot.us

**Infrastructure:**
- Cloudflare Tunnel runs in Docker at `10.0.1.61` — routes `targetid.noirot.us` → `10.0.1.196:80`
- nginx runs on Debian LXC at `10.0.1.196` — serves from `/var/www/targetid`
- nginx config: `/etc/nginx/sites-available/targetid` with `server_name targetid.noirot.us`

**GitHub:** https://github.com/Noirotic1/MinelabTID (branch: `main`)

**Deploy workflow:**
1. Edit `index.html` locally and test via local server
2. `git add index.html && git commit -m "..."` then `git push`
3. SSH to LXC `10.0.1.196`, run `git pull` in `/var/www/targetid`
4. `index.html` is served **network-first** by the service worker, so data/UI changes reach users on their next online launch — no cache bump needed. Bump `CACHE_NAME` in `sw.js` only when adding or changing other static files (icons, manifest).

**Current service worker cache name:** `target-id-v3`

**Service worker strategy:** navigations (and `index.html`) are network-first with cache fallback — all navigation paths (`/`, `/index.html`) share the single `./index.html` cache entry so offline launch works from either URL. Icons and manifest are cache-first.

**Running locally:**
```bash
python3 -m http.server 8080
# or: npx serve .
```
Access on phone via `http://YOUR-LAN-IP:8080` (same Wi-Fi). Service worker requires HTTPS — works on live hosting automatically.

---

## Architecture

**Single-file app** — all CSS and JS live inside `index.html`. No build step. No npm. No framework.

**DETECTORS object** — read-only templates at the top of the `<script>` block. Each entry:
```javascript
{
  label: 'Display name',
  ctx: false,           // true only for CTX 3030 (2D FE/CO system)
  scaleLabel: '...',    // shown in header subtitle
  scaleTicks: [...],    // exactly 6 labels for the gradient scale bar
  targets: [
    { tid: "77–80", item: "Clad Dime (Roosevelt)", cat: "coin", note: "..." },
    ...
  ]
}
```

**userMachines array** — runtime source of truth. Users configure up to 4 machine slots from detector templates. `applyMachine(idx)` is the central function for switching machines.

**Machine slots:** `MAX_MACHINES = 4`. Each slot stores baseKey, label, and user customizations.

**TEMPLATE_ICONS** — maps detector keys to emoji for machine slot display:
```javascript
const TEMPLATE_ICONS = {
  manticore:'🔴', equinox900:'🟠', equinox800:'🔵', equinox700:'🟡',
  atpro:'🟣',     atmax:'🟤',      aceapex:'⚫',
  deus2:'🟨',     deus:'🟧',
  legend:'🟩',    legend2:'🟢',    simplex:'🟦',   triplescore:'🟪',
  vanquish540:'⬜', xterrapro:'🔶', xterraelite:'🔷'
};
```

**Categories** — `coin`, `gold`, `jewelry`, `relic`, `trash`, `iron`

**State persistence** (localStorage):
- `themeMode` — `'night'` | `'day'` | `'auto'`
- `fontSize` — `'sm'` | `'md'` | `'lg'` | `'xl'`
- `discShown` — `'true'` | `'false'`
- `userMachines` — JSON array of configured machine slots

---

## Current Detectors

| Key | Detector | TID Scale | Technology | Icon |
|-----|----------|-----------|------------|------|
| `manticore` | Minelab Manticore | −19 to 99 | Multi-IQ+ | 🔴 |
| `equinox900` | Minelab Equinox 900 | −19 to 99 | Multi-IQ+ | 🟠 |
| `equinox800` | Minelab Equinox 800 | −9 to 40 | Multi-IQ | 🔵 |
| `equinox700` | Minelab Equinox 700 | −19 to 99 | Multi-IQ | 🟡 |
| `ctx3030` | Minelab CTX 3030 | FE 0–35 / CO 1–50 | 2D system | — |
| `vanquish540` | Minelab Vanquish 540 | −9 to 40 | Multi-IQ | ⬜ |
| `xterrapro` | Minelab X-Terra Pro | −19 to 99 | PRO-SWITCH | 🔶 |
| `xterraelite` | Minelab X-Terra Elite | −19 to 99 | WIDEBAND | 🔷 |
| `atpro` | Garrett AT Pro | 0 to 99 | Single freq | 🟣 |
| `atmax` | Garrett AT Max | 0 to 99 | Single freq | 🟤 |
| `aceapex` | Garrett ACE APEX | 0 to 99 | Multi-flex | ⚫ |
| `deus2` | XP Deus II | −6 to 99 | Multi-freq | 🟨 |
| `deus` | XP Deus | 0 to 99 | Single/multi freq | 🟧 |
| `legend` | Nokta Legend | 1 to 60 | Multi-freq | 🟩 |
| `legend2` | Nokta Legend 2 | 1 to 99 | Multi-freq | 🟢 |
| `simplex` | Nokta Simplex+ | 1 to 60 | Single freq | 🟦 |
| `triplescore` | Nokta Triple Score | 1 to 60 | Multi-freq | 🟪 |

### CTX 3030 Special Handling
- `ctx: true` flag triggers CTX-specific rendering
- TID column label changes from "TID" to "FE/CO"
- Warning banner in header explains the 2D system
- TID values formatted as `FE/CO` (e.g., `12/43–45`)
- Range search parser handles both FE and CO segments

### Data Quality Notes
Some detectors have limited community VDI data. These are flagged with `⚠ Limited Community Data` in `scaleLabel` and `(Est.)` appended to individual target notes:

| Detector | Status | Notes |
|----------|--------|-------|
| `legend2` | Limited | Released Oct 2025. Only nickel (25–26) confirmed. Rest estimated from original Legend scale anchors. |
| `xterraelite` | Limited | Confirmed: zinc penny (75–80), clad dime (80–83), silver dime (82–85), quarter (~90). Rest estimated. WIDEBAND tuning differs from X-Terra Pro. |
| `vanquish540` | Moderate | Uses same −9 to 40 scale as Equinox 800; community data exists but thinner. |

---

## Features

### Theme System
- Night (dark), Day (high-contrast light for outdoor sunlight), Auto (follows phone system setting)
- Colors use CSS custom properties on `:root` and `[data-theme="day"]`
- **Onboarding modal always forced to light mode** — CSS variables scoped on `#onboard-modal` override theme for all children regardless of system setting

### Font Size
- 4 sizes: Small (default), Medium, Large, XL
- Card fonts scale via CSS vars; header/chrome fonts are fixed
- Controlled by `data-fsize` attribute on `<html>`

### Machine Editor (`#machine-editor`)
- Follows day/night theme via `var(--bg)` and `var(--surface)` — do NOT hardcode dark colors
- Template picker (`#me-tpl-select`) populates from `DETECTORS` object
- Select/option elements use CSS variable colors for proper theming

### Settings Drawer
- Opens from ⚙ button in header
- Swipe-down to dismiss (80px threshold when scrolled to top)
- Tap overlay to dismiss
- Contains: Machine slots, Display Mode, Font Size, Show Disclaimer toggle, **Support / Ko-fi section**, Credits button

### Ko-fi / Donation
- Settings drawer has "Support the Community" section with Ko-fi button
- Onboarding bottom bar has subtle "❤️ If you find this useful, please buy me a coffee" link
- Both link to: https://ko-fi.com/noirot

### Credits Modal
- Opens from Credits button in settings
- Per-detector sections with sourced references and clickable URLs
- Version stamp at bottom: `Target ID · v1.0 · June 2026`

### Search
- Text match on item name and raw TID string
- **Range-aware numeric search** — typing `77` surfaces any target whose TID range includes 77
- Handles negative ranges, CTX FE/CO format, warning-symbol entries (⚠)

### Disclaimer Footer
- Fixed to bottom with dismiss (✕) button
- Dismissed state saved to localStorage; toggle in settings to re-enable

### Onboarding Screen
- Shows on first launch
- Forced to light mode always (dark mode users included)
- Bottom bar: Ko-fi link (left) + version stamp `v1.0` (right)
- Detector dropdown uses `.onb-select` with hardcoded light-mode hex colors on options (native `<select>` doesn't inherit CSS variables)

### Filter Reset on Machine Switch
- `applyMachine(idx)` clears ALL filter state: `activeCats`, `pinnedTids`, `searchVal`, `scaleTid`
- Also clears search input DOM value and scale bar thumb/tooltip visibility
- Calls `updateFilterButtons()` explicitly for immediate visual reset

### Backup / Restore
- Export button label: "Backup Machine Settings"
- Import button label: "Restore Machine Settings"
- Export filename format: `TargetID_Settings_Backup_YYYY-MM-DD.json`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | May 2026 | Manticore only, basic TID chart |
| v1.5 | May 2026 | Added Equinox 800, day/night/auto theme, font size, swipe dismiss |
| v2.0 | May 2026 | Added Equinox 900 + CTX 3030, Credits modal, range-aware search, renamed to Minelab TID |
| v0.80 | May 2026 | Major expansion: added 13 detectors across 4 brands, machine slots system, onboarding, Ko-fi, filter reset, backup/restore, version display. Renamed to Target ID. |
| v1.0 | June 2026 | Public launch. Renumbered from v0.80. Network-first service worker (deploys reach users without cache bumps), offline launch from `/`, Open Graph/social meta tags, favicon, maskable Android icons, onboarding CTA contrast fix, single-row scrollable filters (advanced mode), desktop max-width column, danger-styled reset button, machine editor Cancel/Discard Changes dirty-state label. |

---

## Adding a New Detector — Checklist

1. **DETECTORS object** — add entry in `index.html` with `label`, `ctx`, `scaleLabel`, `scaleTicks` (exactly 6), and `targets` array
2. **TEMPLATE_ICONS** — add `key:'emoji'` entry
3. **Onboarding dropdown** (`#onb-det-select`) — add `<option value="key">Name</option>` in the correct `<optgroup>`
4. **Machine editor dropdown** (`#me-tpl-select`) — same option in same optgroup (both dropdowns have identical optgroup structure; `replace_all:true` updates both at once)
5. **Credits modal** — add a `<div class="cr-section">` block with sources
6. **CLAUDE.md** — add row to detector table and data sources below
7. **sw.js** — bump `CACHE_NAME` only if adding new static files (not needed for data-only changes)

### Dropdown optgroup structure (both dropdowns identical):
- Garrett: ACE APEX, AT MAX, AT Pro
- Minelab: Equinox 700, Equinox 800, Equinox 900, Manticore, Vanquish 540, X-Terra Pro, X-Terra Elite
- Nokta: Legend, Legend 2, Simplex+, Triple Score
- XP: Deus, Deus II
- *(machine editor only)* Custom: Start Blank

### Data quality standards:
- Well-sourced detectors: no special markers needed
- Limited data: add `⚠ Limited Community Data` to `scaleLabel`; append `(Est.)` to individual target notes
- At minimum, confirm nickel and one coin value from community before publishing

---

## Data Sources (by detector)

### Minelab Manticore
- Big Boys Hobbies 2025 Manticore Coin Chart: https://bigboyshobbies.net/blogs/default-blog/minelab-manticore-coin-chart-2025
- Big Boys Hobbies Manticore TID List 2025: https://bigboyshobbies.net/blogs/default-blog/minelab-manticore-target-id-list-2025
- DetectorProspector Manticore VDI Chart (BigSky): https://www.detectorprospector.com/topic/21367-manticore-v-d-i-chart/
- FindMall 900/Manticore VDI Thread: https://www.findmall.com/threads/for-those-interested-900-manticore-vdi-chart.365093/

### Minelab Equinox 900
- TreasureNet Equinox 900 VDI Thread: https://www.treasurenet.com/threads/equinox-900-vdi-chart.682499/
- Kellyco Detectors Equinox 900 Guide: https://www.kellycodetectors.com/minelab-equinox-900-metal-detector/
- FindMall 900/Manticore VDI Thread (shared with Manticore above)

### Minelab Equinox 800
- Big Boys Hobbies Equinox ID Chart: https://bigboyshobbies.net/blogs/default-blog/minelab-equinox-metal-detector-id-chart-numbers-quick-reference-guide
- DetectorProspector Equinox VDI Chart: https://www.detectorprospector.com/topic/5472-another-equinox-vdi-chart/
- DetectorProspector US Gold Coins EQX 800: https://www.detectorprospector.com/topic/10972-us-gold-coins-and-the-eqx-800/
- History Detector Equinox 800 VDI Numbers: https://www.historydetector.com/minelab/minelab-equinox-800-vdi-numbers/

### Minelab CTX 3030
- Big Boys Hobbies CTX 3030 Exclusive Guide: https://bigboyshobbies.net/pages/minelab-ctx-3030-exclusive-guide
- Minelab CTX 3030 Instruction Manual: https://www.manualslib.com/manual/742490/Minelab-Ctx3030.html?page=15
- MetalDetectingWorld CTX Tone ID Map: https://www.metaldetectingworld.com/ctx3030_tone_id_map.shtml
- FindMall CTX 3030 Target ID Chart (4 Modes): https://www.findmall.com/threads/ctx3030-target-id-chart-for-4-modes.362026/

### Minelab Vanquish 540
- FindMall Vanquish VDI Discussion: https://www.findmall.com/threads/vanquish-vdi-target-id.360000/
- TreasureNet Vanquish 540 VDI Thread: https://www.treasurenet.com/threads/vanquish-540-vdi.680000/
- ManualsLib Minelab Vanquish 540: https://www.manualslib.com/brand/minelab/vanquish-540/

### Minelab X-Terra Pro
- TreasureNet X-Terra Target ID Numbers: https://www.treasurenet.com/threads/new-x-terra-target-id-numbers.265799/
- DetectorProspector X-Terra Pro Database: https://www.detectorprospector.com/metal-detector-database/minelab-x-terra-pro-r159/
- IrateMetalDetectors X-Terra Pro Target ID Bible: https://www.iratemetaldetectors.com/product-page/minelab-x-terra-pro-target-id-bible

### Minelab X-Terra Elite ⚠ Limited Data
- Metal Detecting Forum — X-Terra Elite Coin VDI Numbers: https://metaldetectingforum.com/index.php?threads/xterra-elite-coin-vdi-numbers.310602/
- Prospecting Australia — X-Terra Elite VDI Chart: https://www.prospectingaustralia.com/threads/xterra-elite-vdi-chart.43303/
- Minelab Official Specs: https://usa.minelab.com/x-terra-elite

### Garrett AT Pro / AT Max / ACE APEX
- (Sources in Credits modal HTML)

### XP Deus II
- (Sources in Credits modal HTML)

### XP Deus
- (Sources in Credits modal HTML)

### Nokta Legend
- (Sources in Credits modal HTML)

### Nokta Legend 2 ⚠ Limited Data — Released Oct 2025
- DetectorProspector Legend VDI Thread: https://www.detectorprospector.com/topic/21468-legend-vdis/
- Kellyco Legend 2 vs Legend Comparison: https://www.kellycodetectors.com/blog/the-nokta-legend-2-whats-actually-different-and-what-real-detectorists-are-saying/
- Nokta Official Legend 2 Page: https://noktadetectors.com/metal-detectors/legend-2/

### Nokta Simplex+
- DetectorProspector Simplex VDI Scale: https://www.detectorprospector.com/topic/18252-simplex-vdi-scale-for-united-states-targets/
- FindMall Simplex ID Numbers: https://www.findmall.com/threads/simplex-and-id-numbers-etc.348289/
- ManualsLib Nokta Simplex+ Manual: https://www.manualslib.com/manual/1826281/Nokta-Makro-SimplexPlus.html

### Nokta Triple Score
- Nokta Official Triple Score Page: https://noktadetectors.com/metal-detectors/triple-score/
- ManualsLib Nokta Triple Score Manual: https://www.manualslib.com/brand/nokta/triple-score/
- DetectorProspector Nokta Forum: https://www.detectorprospector.com/forum/forum/metal-detecting-equipment/nokta/

---

## Known Field-Tested Corrections
- **Manticore clad dime**: TID 77–80 (field-tested by Mike Noirot; published charts showed 80–85, conflating it with copper pennies)

---

## CSS Architecture Notes

- All theme colors are CSS custom properties on `:root` (night) and `[data-theme="day"]` (day)
- **Never hardcode dark background colors** in JS-driven UI panels — use `var(--bg)`, `var(--surface)`, etc.
- **`#onboard-modal`** overrides CSS vars to force light mode for all children
- **Native `<select>/<option>` elements** do not inherit CSS variables — must use hardcoded hex colors or explicit CSS rules targeting `option` elements
- `.onb-select option` — hardcoded with `background-color:#f0f4f8; color:#0f172a` (light mode)
- `#me-tpl-select option`, `.me-cexp-select option`, `#me-cat-select option` — use `var(--input-bg)` and `var(--text)`
