import { fetchCountries } from "./api.js";

import {
  getFavorites,
  toggleFavorite,
  getCompareList,
  addToCompare,
  removeFromCompare,
  clearCompare,
  getTheme,
  saveTheme
} from "./storage.js";

let countries = [];
let showFavoritesOnly = false;
let visibleCountries = 8;

const $ = (id) => document.getElementById(id);

const searchInput = $("searchInput");
const regionFilter = $("regionFilter");
const sortSelect = $("sortSelect");
const countryGrid = $("countryGrid");
const loadingState = $("loadingState");
const errorState = $("errorState");
const emptyState = $("emptyState");
const errorMessage = $("errorMessage");
const resultCount = $("resultCount");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("en-IN")
    : "Not available";
}

function showToast(message) {
  const container = $("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");

  toast.className =
    "rounded-lg bg-forest px-5 py-3 text-sm text-paper shadow-lg";

  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = theme;

  const icon = $("themeIcon");

  if (icon) {
    icon.className = isDark
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";
  }
}

applyTheme(getTheme());

$("themeToggle")?.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";

  saveTheme(nextTheme);
  applyTheme(nextTheme);
});


$("searchFocusBtn")?.addEventListener("click", () => {
  $("explorer")?.scrollIntoView({ behavior: "smooth" });
  searchInput?.focus();
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();

    $("explorer")?.scrollIntoView({ behavior: "smooth" });
    searchInput?.focus();
  }

  if (event.key === "Escape") {
    closeModal("detailModal");
    closeModal("compareModal");
  }
});

async function loadCountries() {
  loadingState?.classList.remove("hidden");
  errorState?.classList.add("hidden");
  emptyState?.classList.add("hidden");

  if (countryGrid) countryGrid.innerHTML = "";

  if (resultCount) resultCount.textContent = "Loading countries...";

  try {
    const data = await fetchCountries();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No country data was received.");
    }

    countries = data;

    loadingState?.classList.add("hidden");

    updateFavoriteCount();
    renderCountries();
  } catch (error) {
    console.error("Country loading error:", error);

    loadingState?.classList.add("hidden");
    errorState?.classList.remove("hidden");

    if (errorMessage) {
      errorMessage.textContent =
        error.message || "Could not load countries. Please try again.";
    }

    if (resultCount) {
      resultCount.textContent = "Country data unavailable";
    }
  }
}

function getFilteredCountries() {
  const search = (searchInput?.value || "").trim().toLowerCase();
  const region = regionFilter?.value || "all";
  const sort = sortSelect?.value || "name-asc";

  let filtered = [...countries];

  if (search) {
    filtered = filtered.filter((country) => {
      const name = country.name || "";
      const capital = (country.capital || []).join(" ");
      const subregion = country.subregion || "";
      const regionName = country.region || "";

      return [name, capital, subregion, regionName]
        .some((value) => value.toLowerCase().includes(search));
    });
  }

  if (region !== "all") {
    filtered = filtered.filter(
      (country) => country.region === region
    );
  }

  if (showFavoritesOnly) {
    const favorites = getFavorites();

    filtered = filtered.filter(
      (country) => favorites.includes(country.code)
    );
  }

  filtered.sort((a, b) => {
    switch (sort) {
      case "name-desc":
        return b.name.localeCompare(a.name);

      case "population-desc":
        return (b.population ?? -1) - (a.population ?? -1);

      case "population-asc":
        return (a.population ?? Infinity) - (b.population ?? Infinity);

      case "area-desc":
        return (b.area ?? -1) - (a.area ?? -1);

      case "area-asc":
        return (a.area ?? Infinity) - (b.area ?? Infinity);

      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
}

function renderCountries() {
  if (!countryGrid) return;

  const filtered = getFilteredCountries();
  const favorites = getFavorites();
  const compareList = getCompareList();
  const countriesToShow = filtered.slice(0, visibleCountries);

  countryGrid.innerHTML = "";

  loadingState?.classList.add("hidden");
  errorState?.classList.add("hidden");

  if (resultCount) {
    resultCount.textContent =
      `${filtered.length} ${filtered.length === 1 ? "country" : "countries"} found`;
  }

  emptyState?.classList.toggle("hidden", filtered.length !== 0);

  countriesToShow.forEach((country) => {
    const isFavorite = favorites.includes(country.code);
    const isCompared = compareList.includes(country.code);

    const card = document.createElement("article");

    card.className =
      "destination-card overflow-hidden border border-forest/15 bg-white/50 dark:border-slate-700 dark:bg-slate-900";

      card.dataset.countryCode = country.code;

    card.innerHTML = `
      <div class="flex h-44 items-center justify-center overflow-hidden bg-[#EDE1CE] p-4 dark:bg-slate-800">
        ${country.flag
        ? `<img src="${escapeHTML(country.flag)}"
                alt="${escapeHTML(country.flagAlt || country.name + " flag")}"
                class="max-h-full max-w-full object-contain"
                loading="lazy">`
        : `<span class="text-5xl">🌍</span>`
      }
      </div>

      <div class="p-5">
        <p class="text-xs uppercase tracking-widest text-terracotta">
          ${escapeHTML(country.region || "Region unavailable")}
        </p>

        <h3 class="mt-2 text-3xl">
          ${escapeHTML(country.name)}
        </h3>

        <p class="mt-3 text-sm text-ink/70 dark:text-slate-300">
          Capital: ${escapeHTML((country.capital || []).join(", ") || "Not available")}
        </p>

        <p class="mt-1 text-sm text-ink/70 dark:text-slate-300">
          Population: ${formatNumber(country.population)}
        </p>

        <p class="mt-1 text-sm text-ink/70 dark:text-slate-300">
          Area: ${formatNumber(country.area)} km²
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          <button data-action="details"
            class="bg-forest px-4 py-2 text-xs text-paper hover:bg-terracotta">
            Explore
          </button>

          <button data-action="favorite"
            aria-pressed="${isFavorite}"
            class="border border-forest/30 px-3 py-2 text-xs dark:border-slate-600">
            <i class="fa-${isFavorite ? "solid" : "regular"} fa-heart"></i>
            ${isFavorite ? "Saved" : "Save"}
          </button>

          <button data-action="compare"
            aria-pressed="${isCompared}"
            class="border border-forest/30 px-3 py-2 text-xs dark:border-slate-600">
            ${isCompared ? "Selected" : "Compare"}
          </button>
        </div>
      </div>
    `;

    countryGrid.appendChild(card);
  });

  const exploreMoreBtn = $("exploreMoreBtn");

 if (exploreMoreBtn) {
  exploreMoreBtn.classList.toggle("hidden", filtered.length <= visibleCountries);
}

  updateCompareBar();
  updateActiveFilters();
}

const exploreMoreBtn = $("exploreMoreBtn");

exploreMoreBtn?.addEventListener("click", () => {
  if (visibleCountries < 16) {
    visibleCountries = 16;
  } else {
    visibleCountries = countries.length;
  }

  renderCountries();
});

countryGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button || !countryGrid.contains(button)) return;

  const card = button.closest("[data-country-code]");
  if (!card) return;

  const country = countries.find(
    (item) => item.code === card.dataset.countryCode
  );

  if (!country) return;

  const action = button.dataset.action;

  if (action === "details") {
    showCountryDetails(country);
  }

  if (action === "favorite") {
    toggleFavorite(country.code);
    updateFavoriteCount();
    renderCountries();
    showToast("Favourites updated!");
  }

  if (action === "compare") {
    const current = getCompareList();

    if (current.includes(country.code)) {
      removeFromCompare(country.code);
    } else {
      if (current.length >= 3) {
        showToast("You can compare up to 3 countries.");
        return;
      }

      addToCompare(country.code);
    }

    updateCompareBar();
    renderCountries();
  }
});

function updateFavoriteCount() {
  const count = $("favoriteCount");

  if (count) count.textContent = getFavorites().length;
}

function updateActiveFilters() {
  const container = $("activeFilters");
  if (!container) return;

  const labels = [];

  if (searchInput?.value.trim()) {
    labels.push("Search: " + searchInput.value.trim());
  }

  if (regionFilter?.value && regionFilter.value !== "all") {
    labels.push("Region: " + regionFilter.value);
  }

  if (showFavoritesOnly) {
    labels.push("Favourites only");
  }

  container.textContent = labels.join(" · ");
}

function showCountryDetails(country) {
  const modal = $("detailModal");
  const content = $("detailContent");

  if (!modal || !content) return;

  const currencies = (country.currencies || [])
    .map((currency) => {
      const name = currency?.name || "Not available";
      const code = currency?.code ? ` (${currency.code})` : "";
      const symbol = currency?.symbol ? ` ${currency.symbol}` : "";

      return `${name}${code}${symbol}`;
    })
    .filter(Boolean)
    .join(", ");

  content.innerHTML = `
    <div class="grid gap-6 sm:grid-cols-2">
      <div>
        ${country.flag
      ? `<img src="${escapeHTML(country.flag)}"
                alt="${escapeHTML(country.name)} flag"
                class="mb-5 max-h-48 w-full object-contain">`
      : ""
    }

        <h2 id="detailCountryName" class="text-4xl">
          ${escapeHTML(country.name)}
        </h2>

        <p class="mt-2 text-sm text-terracotta">
          ${escapeHTML(country.officialName)}
        </p>

        <p class="mt-4 text-sm">
          <strong>Region:</strong> ${escapeHTML(country.region)}
        </p>

        <p class="mt-2 text-sm">
          <strong>Subregion:</strong> ${escapeHTML(country.subregion)}
        </p>

        <p class="mt-2 text-sm">
          <strong>Capital:</strong>
          ${escapeHTML((country.capital || []).join(", ") || "Not available")}
        </p>
      </div>

      <div class="space-y-3 text-sm">
        <p><strong>Population:</strong> ${formatNumber(country.population)}</p>
        <p><strong>Area:</strong> ${formatNumber(country.area)} km²</p>
        <p><strong>Languages:</strong> ${escapeHTML((country.languages || []).join(", ") || "Not available")}</p>
        <p><strong>Currencies:</strong> ${escapeHTML(currencies || "Not available")}</p>
        <p><strong>Border Countries:</strong></p>

          <div class="mt-2 flex flex-wrap gap-2">
             ${(country.borders || []).map((borderCode) => {
                 const borderCountry = countries.find(
                    (item) => item.code === borderCode
                  );

            return borderCountry
               ? `<button
                      type="button"
                        data-border-code="${escapeHTML(borderCode)}"
                          class="rounded-full border border-forest/30 px-3 py-2 text-xs transition hover:bg-forest hover:text-paper dark:border-slate-600">
                    ${escapeHTML(borderCountry.name)}
                  </button>`
              : "";
            }).join("") || '<span class="text-sm">No border countries listed</span>'
            }
          </div>
        
        <p><strong>Continents:</strong> ${escapeHTML((country.continents || []).join(", ") || "Not available")}</p>
        <p><strong>Time zones:</strong> ${escapeHTML((country.timezones || []).join(", ") || "Not available")}</p>

        ${country.mapUrl
      ? `<a href="${escapeHTML(country.mapUrl)}"
                target="_blank" rel="noopener noreferrer"
                class="mt-4 inline-block bg-forest px-5 py-3 text-paper hover:bg-terracotta">
                Open Google Maps
              </a>`
      : ""
    }
      </div>
    </div>
  `;


  
content.querySelectorAll("[data-border-code]").forEach((button) => {
  button.addEventListener("click", () => {
    const borderCode = button.dataset.borderCode;

    const borderCountry = countries.find(
      (item) => item.code === borderCode
    );

    if (borderCountry) {
      showCountryDetails(borderCountry);
    }
  });
});

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal(id) {
  const modal = $(id);

  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

$("closeDetailModal")?.addEventListener("click", () => {
  closeModal("detailModal");
});

$("closeCompareBtn")?.addEventListener("click", () => {
  closeModal("compareModal");
});

["detailModal", "compareModal"].forEach((id) => {
  $(id)?.addEventListener("click", (event) => {
    if (event.target.id === id) closeModal(id);
  });
});

function updateCompareBar() {
  const bar = $("compareBar");
  const text = $("compareCount");
  const compareList = getCompareList();

  if (!bar) return;

  bar.classList.toggle("hidden", compareList.length === 0);

  if (text) {
    const selectedNames = compareList.map((code) => {
      return countries.find((country) => country.code === code)?.name || code;
    });

    const count = compareList.length;

text.textContent =
  `${count} ${count === 1 ? "Country" : "Countries"} Selected` +
  (selectedNames.length ? ": " + selectedNames.join(", ") : "");
      
  }
}

$("clearCompareBtn")?.addEventListener("click", () => {
  clearCompare();
  updateCompareBar();
  renderCountries();
});

$("compareBtn")?.addEventListener("click", () => {
  const selected = getCompareList()
    .map((code) => countries.find((country) => country.code === code))
    .filter(Boolean);

  if (selected.length < 2) {
    showToast("Choose at least 2 countries to compare.");
    return;
  }

  const modal = $("compareModal");
  const content = $("compareContent");

  if (!modal || !content) return;

  const fields = [
    ["Capital", (c) => (c.capital || []).join(", ") || "Not available"],
    ["Region", (c) => c.region],
    ["Population", (c) => formatNumber(c.population)],
    ["Area (km²)", (c) => formatNumber(c.area)],
    ["Languages", (c) => (c.languages || []).join(", ") || "Not available"],
    ["Currencies", (c) => (c.currencies || []).map((x) => x.name).join(", ") || "Not available"]
  ];

  content.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th class="border-b p-3">Feature</th>
            ${selected.map((c) => `
              <th class="border-b p-3">${escapeHTML(c.name)}</th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          ${fields.map(([label, getter]) => `
            <tr>
              <th class="border-b p-3">${escapeHTML(label)}</th>
              ${selected.map((c) => `
                <td class="border-b p-3">${escapeHTML(getter(c))}</td>
              `).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
});

searchInput?.addEventListener("input", () => {
  visibleCountries = 8;
  renderCountries();
});

regionFilter?.addEventListener("change", () => {
  visibleCountries = 8;
  renderCountries();
});

sortSelect?.addEventListener("change", () => {
  visibleCountries = 8;
  renderCountries();
});

$("allCountriesBtn")?.addEventListener("click", () => {
  showFavoritesOnly = false;

  if (searchInput) searchInput.value = "";
  if (regionFilter) regionFilter.value = "all";
  if (sortSelect) sortSelect.value = "name-asc";

  renderCountries();
});

$("showFavoritesBtn")?.addEventListener("click", () => {
  showFavoritesOnly = !showFavoritesOnly;
  renderCountries();
});

$("refreshBtn")?.addEventListener("click", loadCountries);
$("retryBtn")?.addEventListener("click", loadCountries);

$("clearFiltersBtn")?.addEventListener("click", () => {
  showFavoritesOnly = false;

  if (searchInput) searchInput.value = "";
  if (regionFilter) regionFilter.value = "all";
  if (sortSelect) sortSelect.value = "name-asc";

  renderCountries();
});

$("tripForm")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const style = $("tripStyle")?.value || "Adventure";
  const region = $("tripRegion")?.value || "any";
  const notes = $("tripNotes")?.value.trim() || "";

  let choices = countries.filter((country) => {
    const matchesRegion = region === "any" || country.region === region;
    return matchesRegion;
  });

  if (choices.length === 0) {
    $("tripResult").textContent =
      "No countries found for that region. Try another region.";
    return;
  }

  const country = choices[Math.floor(Math.random() * choices.length)];

  $("tripResult").textContent =
    `Your ${style.toLowerCase()} inspiration: ${country.name}.` +
    (notes ? ` Your notes: ${notes}` : "");

  $("tripResult").classList.add("mt-5");
});

if ($("currentYear")) {
  $("currentYear").textContent = new Date().getFullYear();
}

loadCountries();
