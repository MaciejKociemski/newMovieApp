const apiKey = "de186dea4489f09c1a470dddfd9aaeae";
const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;

const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");

let page = 1;
let isSearching = false;

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("response is not ok");
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function fetchAndShowResult(url) {
  const data = await fetchData(url);
  if (data && data.results) {
    showResults(data.results);
  }
}

function createMovieCard(movie) {
  const { poster_path, original_title, release_date, overview } = movie;
  const imagePath = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "./img/error.png";
  const truncatedTitle =
    original_title.length > 15
      ? original_title.slice(0, 15) + "..."
      : original_title;
  const formattedDate = release_date || "no release date";
  const cardTemplate = `
        <div class="column">
            <div class="card">
                <a class="card-media" href="${imagePath}" target="_blank">
                    <img src="${imagePath}" alt="${original_title}" width="100%" />
                </a>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left-content">
                            <h3 style="font-weight: 600">${truncatedTitle}</h3>
                            <span style="color: #12efec">${formattedDate}</span>
                        </div>
                        <div class="right-content">
                            <a href="${imagePath}" target="_blank" class="card-btn">see cover</a>
                        </div>
                    </div>
                    <div class="info">
                        ${overview || "no description..."}
                    </div>
                </div>
            </div>
        </div>
    `;
  return cardTemplate;
}

function clearResults() {
  if (result) {
    result.innerHTML = "";
  }
}

function showResults(item) {
  if (result) {
    const newContent = item.map(createMovieCard).join("");
    result.innerHTML += newContent || "<p>No results found</p>";
  }
}

async function loadMoreResults() {
  if (isSearching) {
    return;
  }
  page++;
  const searchTerm = query.value;
  const url = searchTerm
    ? `${searchUrl}${searchTerm}&page=${page}`
    : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
  await fetchAndShowResult(url);
}

function detectEnd() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 20) {
    loadMoreResults();
  }
}

async function handleSearch(e) {
  e.preventDefault();
  const searchTerm = query.value.trim();
  if (searchTerm.length < 2) {
    Swal.fire({
      icon: "info",
      title: "sorry",
      text: "input at least 2 characters.",
      customClass: {
        popup: "my-custom-size",
      },
    });
    return;
  }

  isSearching = true;
  clearResults();
  const newUrl = `${searchUrl}${searchTerm}&page=${page}`;
  await fetchAndShowResult(newUrl);
  query.value = "";
}

form.addEventListener("submit", handleSearch);
window.addEventListener("scroll", detectEnd);
window.addEventListener("resize", detectEnd);

async function init() {
  clearResults();
  const url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity_date.desc&api_key=${apiKey}&page=${page}`;
  isSearching = false;
  await fetchAndShowResult(url);
}

init();
