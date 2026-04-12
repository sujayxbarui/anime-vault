# Anime Vault — Personal Anime Tracker

Search, discover, and favourite your anime — all in one place. No account needed.

---

## Project Purpose

Anime Vault is a personal anime tracking web app built for fans who want to quickly search, explore, and save their favourite shows without creating accounts on external platforms.

Search any anime in real-time, filter by genre, type, or airing status, sort results your way, and heart the ones you love. Everything saves locally in your browser — no login, no backend required.

---

## API Used

**Jikan API v4** — Unofficial MyAnimeList REST API
- Link: https://api.jikan.moe/v4
- Docs: https://docs.api.jikan.moe/
- API Key Required: **None** — completely free and open

---

## Features Implemented

- **Search** — Real-time anime search with debouncing (no API call on every keystroke)
- **Filter** — Filter by genre, type (TV / Movie / OVA / Special), and airing status
- **Sort** — Sort results by score, popularity, title (A→Z), or episode count
- **Favourites** — Heart any anime to save it locally; unfavourite to remove
- **Favourites Tab** — Dedicated tab to view, search, and sort your saved anime
- **Dark / Light Mode** — Theme toggle, preference saved in localStorage
- **Pagination** — Navigate through large result sets page by page
- **Loading States** — Animated sakura loader shown during every API call
- **Error Handling** — Friendly error message shown if API call fails
- **Responsive UI** — Fully responsive across mobile, tablet, and desktop

---

## Project Structure

```
anime-vault/
├── index.html        # App shell — layout, search bar, filter dropdowns, tab nav, card grid, pagination
├── style.css         # All styles — CSS variables, light/dark theme, Flexbox/Grid, sakura loader, media queries
├── app.js            # All logic — Jikan API calls, debouncing, HOFs (.filter .map .find .sort), DOM rendering, localStorage
└── README.md         # Docs — purpose, API info, features, HOFs table, milestones, run instructions, author
```

### File Responsibilities

#### `index.html`
The entry point and app shell. Defines the visible structure — search input, filter dropdowns, tab buttons (Discover / Favourites), card grid container, and pagination controls. Links in `style.css` and `app.js`. No build step required — open directly in any browser.

#### `style.css`
All visual rules. CSS custom properties at `:root` drive theming — toggling light/dark mode flips one attribute on `<body>`, not individual rules. Flexbox and Grid handle the responsive layout. `@keyframes` powers the sakura loading animation. Media queries ensure the layout adapts across mobile, tablet, and desktop.

#### `app.js`
The brain of the app. Handles:
- Jikan API v4 calls with debouncing (prevents excessive requests on keystroke)
- All Higher Order Functions — `.filter()`, `.map()`, `.find()`, `.sort()`, `Array.from().map()`, `.forEach()`
- DOM rendering for anime cards, pagination buttons, and error/loading states
- `localStorage` reads and writes for favourites and theme preference
- All event listeners for search, filters, sort, tabs, and pagination

#### `README.md`
Project documentation covering purpose, API details, feature list, HOFs table, project structure, milestones, run instructions, and author info.

---

## Array HOFs Used

| HOF | Where Used |
|---|---|
| `.filter()` | Filter valid cards before render; remove favourite from list; search favourites tab |
| `.map()` | Build card elements from anime data; shape favourite data for render; build pagination buttons |
| `.find()` | Check if an anime is already favourited |
| `.sort()` | Sort favourites by score, title, or date added |
| `Array.from().map()` | Generate pagination page number buttons |
| `.forEach()` | Append rendered cards and buttons to the DOM |

---

## Technologies

- HTML5
- CSS3 (CSS Variables, Flexbox, Grid, Media Queries)
- Vanilla JavaScript (ES6+)
- Fetch API
- localStorage (favourites + theme persistence)

---

## How to Run

Open `index.html` directly in any browser — no build tools or installations needed.

Or with VS Code Live Server: right-click `index.html` → **Open with Live Server**.

---

## Milestones

| Milestone | Description | Deadline | Status |
|---|---|---|---|
| M1 | Project Setup & Planning | 23rd March | ✅ Done |
| M2 | API Integration & Responsive UI | 1st April | ✅ Done |
| M3 | Search, Filter, Sort, Dark Mode, Favourites | 8th April | ✅ Done |
| M4 | Documentation, Deployment & Final Submission | 12th April | ✅ Done |

---

## Author

Sujay Barui — https://github.com/sujayxbarui
