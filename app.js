const BASE_URL = 'https://api.jikan.moe/v4';


let currentPage   = 1;
let totalPages    = 1;
let currentQuery  = '';
let currentGenre  = '';
let currentType   = '';
let currentStatus = '';
let currentSort   = 'score';
let debounceTimer = null;
let activeTab     = 'discover';
let favourites    = JSON.parse(localStorage.getItem('animevault_favs') || '[]');


const searchInput  = document.getElementById('searchInput');
const genreFilter  = document.getElementById('genreFilter');
const typeFilter   = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const sortFilter   = document.getElementById('sortFilter');
const animeGrid    = document.getElementById('animeGrid');
const loader       = document.getElementById('loader');
const errorBox     = document.getElementById('errorBox');
const pagination   = document.getElementById('pagination');
const sectionTitle = document.getElementById('sectionTitle');
const resultCount  = document.getElementById('resultCount');
const favGrid      = document.getElementById('favGrid');
const favSearch    = document.getElementById('favSearch');
const favSort      = document.getElementById('favSort');
const favBadge     = document.getElementById('favBadge');
const emptyFav     = document.getElementById('emptyFav');
const themeBtn     = document.getElementById('themeBtn');
const toast        = document.getElementById('toast');


applyTheme();
updateFavBadge();
attachListeners();
loadAnime();




async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function loadAnime() {
  showLoader();
  hideError();

  try {
    const orderMap = { score: 'score', popularity: 'popularity', title: 'title', episodes: 'episodes' };
    let url;

    if (currentQuery.trim()) {
      url = `${BASE_URL}/anime?q=${encodeURIComponent(currentQuery)}&page=${currentPage}&limit=20&sfw=true`;
      if (currentGenre)  url += `&genres=${currentGenre}`;
      if (currentType)   url += `&type=${currentType}`;
      if (currentStatus) url += `&status=${currentStatus}`;
      url += `&order_by=${orderMap[currentSort]}&sort=desc`;
      sectionTitle.textContent = `🔍 Results for "${currentQuery}"`;

    } else if (currentGenre || currentType || currentStatus) {
      url = `${BASE_URL}/anime?page=${currentPage}&limit=20&sfw=true`;
      if (currentGenre)  url += `&genres=${currentGenre}`;
      if (currentType)   url += `&type=${currentType}`;
      if (currentStatus) url += `&status=${currentStatus}`;
      url += `&order_by=${orderMap[currentSort]}&sort=desc`;
      sectionTitle.textContent = '🎛 Filtered Results';

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




function renderAnimeGrid(animes) {
  animeGrid.innerHTML = '';

  if (!animes || animes.length === 0) {
    animeGrid.innerHTML = `<p class="no-results">No anime found. Try adjusting your search or filters!</p>`;
    return;
  }


  animes
    .filter(a => a.mal_id && a.title)
    .map((a, i) => createCard(a, i))
    .forEach(card => animeGrid.appendChild(card));
}

function createCard(anime, index = 0) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.style.animationDelay = `${index * 0.04}s`;

  const score    = anime.score ? anime.score.toFixed(1) : 'N/A';
  const episodes = anime.episodes ? `${anime.episodes} ep` : '?? ep';
  const type     = anime.type || 'TV';
  const poster   = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null;


  const isFav = favourites.find(f => f.mal_id === anime.mal_id);

  card.innerHTML = `
    <div class="card-poster-wrap">
      ${poster
        ? `<img src="${poster}" alt="${anime.title}" loading="lazy" />`
        : `<div class="no-poster">🌸</div>`
      }
      <div class="card-score">⭐ ${score}</div>
      <button class="fav-btn ${isFav ? 'fav-active' : ''}" data-id="${anime.mal_id}" title="Favourite">
        ${isFav ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="card-info">
      <div class="card-title" title="${anime.title}">${anime.title}</div>
      <div class="card-meta">
        <span class="card-type">${type}</span>
        <span>${episodes}</span>
      </div>
    </div>
  `;


  card.querySelector('.fav-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavourite(anime, card.querySelector('.fav-btn'));
  });

  return card;
}




function toggleFavourite(anime, btn) {
  // HOF: find
  const exists = favourites.find(f => f.mal_id === anime.mal_id);

  if (exists) {

    favourites = favourites.filter(f => f.mal_id !== anime.mal_id);
    btn.textContent = '🤍';
    btn.classList.remove('fav-active');
    showToast(`Removed "${anime.title}" from favourites`);
  } else {
    favourites.unshift({
      mal_id:   anime.mal_id,
      title:    anime.title,
      score:    anime.score || 0,
      episodes: anime.episodes || null,
      type:     anime.type || 'TV',
      image:    anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
      addedAt:  Date.now(),
    });
    btn.textContent = '❤️';
    btn.classList.add('fav-active');
    showToast(`Added "${anime.title}" to favourites`);
  }

  localStorage.setItem('animevault_favs', JSON.stringify(favourites));
  updateFavBadge();
  if (activeTab === 'favourites') renderFavourites();
}

function renderFavourites() {
  const q = favSearch.value.trim().toLowerCase();
  const sortPref = favSort.value;


  let result = favourites.filter(f =>
    q ? f.title.toLowerCase().includes(q) : true
  );


  result = [...result].sort((a, b) => {
    if (sortPref === 'score') return (b.score || 0) - (a.score || 0);
    if (sortPref === 'title') return a.title.localeCompare(b.title);
    return b.addedAt - a.addedAt;
  });

  favGrid.innerHTML = '';

  if (result.length === 0) {
    emptyFav.classList.remove('hidden');
    return;
  }
  emptyFav.classList.add('hidden');


  result
    .map((f, i) => createCard({
      mal_id:   f.mal_id,
      title:    f.title,
      score:    f.score,
      episodes: f.episodes,
      type:     f.type,
      images:   { jpg: { large_image_url: f.image } },
    }, i))
    .forEach(card => favGrid.appendChild(card));
}

function updateFavBadge() {
  favBadge.textContent = favourites.length;
}




function renderPagination() {
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

  const maxBtns = 5;
  let start = Math.max(1, currentPage - 2);
  let end   = Math.min(totalPages, start + maxBtns - 1);
  if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);

  pagination.appendChild(makePageBtn('← Prev', currentPage === 1, () => { currentPage--; loadAnime(); scrollUp(); }));


  Array.from({ length: end - start + 1 }, (_, i) => start + i)
    .map(p => makePageBtn(p, false, () => { currentPage = p; loadAnime(); scrollUp(); }, p === currentPage))
    .forEach(btn => pagination.appendChild(btn));

  pagination.appendChild(makePageBtn('Next →', currentPage === totalPages, () => { currentPage++; loadAnime(); scrollUp(); }));
}

function makePageBtn(label, disabled, onClick, active = false) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.disabled    = disabled;
  if (active) btn.classList.add('active');
  btn.addEventListener('click', onClick);
  return btn;
}




function applyTheme() {
  const saved = localStorage.getItem('animevault_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  themeBtn.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const cur  = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('animevault_theme', next);
}




function showLoader() { loader.classList.remove('hidden'); animeGrid.innerHTML = ''; pagination.innerHTML = ''; }
function hideLoader() { loader.classList.add('hidden'); }
function showError(msg) { errorBox.textContent = '⚠️ ' + msg; errorBox.classList.remove('hidden'); }
function hideError() { errorBox.classList.add('hidden'); }
function scrollUp() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 350);
  }, 2500);
}




function attachListeners() {


  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${activeTab}`).classList.add('active');
      if (activeTab === 'favourites') renderFavourites();
    });
  });


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


  genreFilter.addEventListener('change',  () => { currentGenre  = genreFilter.value;  currentPage = 1; loadAnime(); });
  typeFilter.addEventListener('change',   () => { currentType   = typeFilter.value;   currentPage = 1; loadAnime(); });
  statusFilter.addEventListener('change', () => { currentStatus = statusFilter.value; currentPage = 1; loadAnime(); });
  sortFilter.addEventListener('change',   () => { currentSort   = sortFilter.value;   currentPage = 1; loadAnime(); });


  favSearch.addEventListener('input', () => renderFavourites());
  favSort.addEventListener('change',  () => renderFavourites());


  themeBtn.addEventListener('click', toggleTheme);
}