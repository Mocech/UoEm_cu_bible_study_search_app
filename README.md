# University Of Embu — Christian Union — Bible Study Group Finder

## Overview
A small static web app for finding CU (Christian Union) bible study group contacts by member or pastor name. The UI is a responsive single-page site that fetches CSV data (published Google Sheets) and renders matching group members, assigned pastor, and subcommittee leaders.

## Features
- Role selector: search as `Members` or `Pastors`.
- Instant search with suggestions and results cards.
- Contact actions: open WhatsApp or call directly using normalized phone numbers.
- Loading / empty / error states and simple masking for phone numbers.

## Files
- [index.html](index.html): Main HTML layout and markup; includes references to `main.css`, `styles.css`, and `app.js`.
- [app.js](app.js): App logic:
  - Configures CSV source URLs in `CONFIG.CSV_URLS`.
  - Fetches CSVs via a CORS proxy (`https://corsproxy.io/?` in the code).
  - Parses CSVs, normalizes phone numbers, provides search, suggestions, and renders results.
  - Contains helper utilities (CSV parser, phone cleaner/mask, DOM rendering).
- [main.css](main.css): Core design system and layout (variables, nav, footer, general components).
- [styles.css](styles.css): App-specific styles (hero, search, result cards, responsive rules).
- [package.json](package.json): Minimal package metadata (no build required).

## Data sources & configuration
Open `app.js` and look for the `CONFIG` object near the top. It contains two published Google Sheets (CSV) URLs: `members` and `pastors`.

Notes:
- The app currently uses `https://corsproxy.io/?` to avoid CORS errors when fetching CSVs from Google Sheets. If you deploy this to a host that allows fetching those CSV URLs directly, you can remove the proxy wrapper.
- Phone normalization assumes Kenyan numbers and converts to `254` country format before building `wa.me` or `tel:` links.

## Run locally
This is a static site — no build step is required.

Option 1 — Open in browser:
- Double-click `index.html` or open it in your browser.

Option 2 — Serve with a simple local server (recommended to avoid CORS/file restrictions):

Windows (PowerShell):

```powershell
# From the project root
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Node (if you have `http-server`):

```bash
npx http-server -c-1 . -p 8000
```

## Customization
- Change data sources: update `CONFIG.CSV_URLS.members` and `CONFIG.CSV_URLS.pastors` in `app.js` to point to your published CSVs (Google Sheets export CSV links).
- Styling: modify variables in `main.css` and component rules in `styles.css`.
- Remove proxy: replace `fetch(proxy + encodeURIComponent(...))` calls in `fetchAllData()` with direct `fetch()` calls once CORS is handled by the host.

## Troubleshooting
- "Failed to load data": check network, ensure the Google Sheets are published to the web (CSV output), and verify the proxy (or CORS) is working.
- Incorrect phone links: phone cleaning assumes Kenyan numbers. Modify `cleanPhone()` in `app.js` for different country formats.
- If suggestions or search return no results: confirm CSV formatting (name in first column, group/year/phone order). The `parseMembers` function expects NAME, GROUP, YEAR, PHONE order.

## Notes for maintainers
- The CSV parser in `app.js` is a simple lightweight implementation and handles quoted fields; it is not a full CSV library. Consider using a robust parser (e.g., PapaParse) for complex CSVs.
- No external dependencies; `package.json` contains no build scripts.

---

If you want, I can:
- Add a small example CSV file and local test data.
- Replace the CORS proxy with a configuration toggle.
- Add a minimal `README` badge or license section.

