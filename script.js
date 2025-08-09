const apiKey = "12367901";

// LocalStorage helper
function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist")) || [];
}
function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

// Search Movies
async function searchMovies(defaultQuery = null) {
  const query = defaultQuery || document.getElementById("searchInput").value.trim();
  const selectedYear = document.getElementById("yearSelect").value;
  const resultsContainer = document.getElementById("movieResults");

  if (!query && !selectedYear) {
    resultsContainer.innerHTML = "<p>Please enter a movie name or select a year</p>";
    return;
  }

  let url = `https://www.omdbapi.com/?s=${encodeURIComponent(query || "movie")}&apikey=${apiKey}`;
  if (selectedYear) url += `&y=${selectedYear}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.Response === "True") {
      displayMovies(data.Search, resultsContainer, false);
    } else {
      resultsContainer.innerHTML = `<p>🚫 ${data.Error}</p>`;
    }
  } catch {
    resultsContainer.innerHTML = "<p>❌ Failed to fetch data</p>";
  }
}

// Display movies
async function displayMovies(movies, container, isWatchlist) {
  container.innerHTML = "";
  for (let movie of movies) {
    const details = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`).then(res => res.json());

    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img src="${details.Poster !== "N/A" ? details.Poster : "https://via.placeholder.com/180x270"}" alt="${details.Title}">
      <h3>${details.Title}</h3>
      <p>📅 ${details.Year}</p>
      <div class="overlay">
        ⭐ ${details.imdbRating} | ${details.Genre}
        <p>${details.Plot.slice(0, 60)}...</p>
      </div>
      <div class="card-buttons">
        <button onclick="fetchMovieDetails('${details.imdbID}')">More Info</button>
        <button class="watchlist-btn" onclick="${isWatchlist ? `removeFromWatchlist('${details.imdbID}')` : `addToWatchlist('${details.imdbID}')`}">
          ${isWatchlist ? "Remove" : "Add"}
        </button>
      </div>
    `;

    container.appendChild(card);
  }
}

// Add to watchlist
async function addToWatchlist(id) {
  const list = getWatchlist();
  if (!list.includes(id)) {
    list.push(id);
    saveWatchlist(list);
    loadWatchlist();
  }
}

// Remove from watchlist
function removeFromWatchlist(id) {
  let list = getWatchlist().filter(item => item !== id);
  saveWatchlist(list);
  loadWatchlist();
}

// Load watchlist
async function loadWatchlist() {
  const list = getWatchlist();
  const watchlistContainer = document.getElementById("watchlist");
  if (list.length === 0) {
    watchlistContainer.innerHTML = "<p>No movies in watchlist.</p>";
    return;
  }
  const movies = list.map(id => ({ imdbID: id }));
  displayMovies(movies, watchlistContainer, true);
}

// Modal
async function fetchMovieDetails(id) {
  const movie = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`).then(res => res.json());
  const modal = document.getElementById("movieModal");
  const modalDetails = document.getElementById("modalDetails");

  modalDetails.innerHTML = `
    <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/400x600"}" />
    <h2>${movie.Title} (${movie.Year})</h2>
    <p><strong>🎖 IMDb Rating:</strong> ${movie.imdbRating}</p>
    <p><strong>🏷 Genre:</strong> ${movie.Genre}</p>
    <p><strong>🎬 Director:</strong> ${movie.Director}</p>
    <p><strong>📝 Plot:</strong> ${movie.Plot}</p>
  `;

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("movieModal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("movieModal");
  if (event.target === modal) closeModal();
};

// Init
window.onload = () => {
  const yearSelect = document.getElementById("yearSelect");
  for (let y = new Date().getFullYear(); y >= 1947; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
  loadWatchlist();
};

// Site links click
document.querySelectorAll(".site-link").forEach(link => {
  link.addEventListener("click", () => {
    window.open(link.getAttribute("data-url"), '_blank');
  });
});
