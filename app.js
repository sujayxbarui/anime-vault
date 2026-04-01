const BASE_URL = 'https://api.jikan.moe/v4';

let currentPage  = 1;
let totalPages   = 1;
let currentQuery = '';
let debounceTimer = null;

const searchInput  = document.getElementById('searchInput');
const animeGrid    = document.getElementById('animeGrid');
const loader       = document.getElementById('loader');
const errorBox     = document.getElementById('errorBox');
const pagination   = document.getElementById('pagination');
const sectionTitle = document.getElementById('sectionTitle');
const resultCount  = document.getElementById('resultCount');

// ── API FETCH ──────────────────────────────────
async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── LOAD DATA ──────────────────────────────────
async function loadAnime() {
  showLoader();
  hideError();

  try {
    let url;

    if (currentQuery.trim()) {
      url = `${BASE_URL}/anime?q=${encodeURIComponent(currentQuery)}&page=${currentPage}&limit=20&sfw=true`;
      sectionTitle.textContent = `🔍 Results for "${currentQuery}"`;
    } else {
      url = `${BASE_URL}/top/anime?page=${currentPage}&limit=20`;
      sectionTitle.textContent = '🏆 Top Anime of All Time';
    }

    const data = await apiFetch(url);
    totalPages = data.pagination?.last_visible_page || 1;
    resultCount.textContent = data.pagination?.items?.total
      ? `${data.pagination.items.total.toLocaleString()} anime`
      : '';

    renderAnimeGrid(data.data);
    renderPagination();

  } catch (err) {
    showError('Failed to load anime. Please try again in a moment.');
    console.error(err);
  } finally {
    hideLoader();
  }
}

// ── RENDER GRID ────────────────────────────────
function renderAnimeGrid(animes) {
  animeGrid.innerHTML = '';

  if (!animes || animes.length === 0) {
    animeGrid.innerHTML = `<p class="no-results">No anime found. Try a different search!</p>`;
    return;
  }

  animes.forEach((anime, i) => {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.style.animationDelay = `${i * 0.04}s`;

    const score   = anime.score ? anime.score.toFixed(1) : 'N/A';
    const episodes = anime.episodes ? `${anime.episodes} ep` : '?? ep';
    const type    = anime.type || 'TV';
    const poster  = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null;

    card.innerHTML = `
      <div class="card-poster-wrap">
        ${poster
          ? `<img src="${poster}" alt="${anime.title}" loading="lazy" />`
          : `<div class="no-poster">🌸</div>`
        }
        <div class="card-score">⭐ ${score}</div>
      </div>
      <div class="card-info">
        <div class="card-title" title="${anime.title}">${anime.title}</div>
        <div class="card-meta">
          <span class="card-type">${type}</span>
          <span>${episodes}</span>
        </div>
      </div>
    `;

    animeGrid.appendChild(card);
  });
}

// ── PAGINATION ─────────────────────────────────
function renderPagination() {
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

  const maxBtns = 5;
  let start = Math.max(1, currentPage - 2);
  let end   = Math.min(totalPages, start + maxBtns - 1);
  if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);

  const prev = makePageBtn('← Prev', currentPage === 1, () => { currentPage--; loadAnime(); scrollUp(); });
  pagination.appendChild(prev);

  for (let p = start; p <= end; p++) {
    pagination.appendChild(makePageBtn(p, false, () => { currentPage = p; loadAnime(); scrollUp(); }, p === currentPage));
  }

  const next = makePageBtn('Next →', currentPage === totalPages, () => { currentPage++; loadAnime(); scrollUp(); });
  pagination.appendChild(next);
}

function makePageBtn(label, disabled, onClick, active = false) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.disabled    = disabled;
  if (active) btn.classList.add('active');
  btn.addEventListener('click', onClick);
  return btn;
}

// ── HELPERS ────────────────────────────────────
function showLoader() { loader.classList.remove('hidden'); animeGrid.innerHTML = ''; pagination.innerHTML = ''; }
function hideLoader() { loader.classList.add('hidden'); }
function showError(msg) { errorBox.textContent = '⚠️ ' + msg; errorBox.classList.remove('hidden'); }
function hideError() { errorBox.classList.add('hidden'); }
function scrollUp() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ── SEARCH (debounced) ─────────────────────────
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentQuery = searchInput.value.trim();
    currentPage  = 1;
    loadAnime();
  }, 600);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    clearTimeout(debounceTimer);
    currentQuery = searchInput.value.trim();
    currentPage  = 1;
    loadAnime();
  }
});

// ── START ──────────────────────────────────────
loadAnime();
