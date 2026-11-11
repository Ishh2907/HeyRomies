import {
  escapeHTML,
  formatPopulation,
  formatArea,
  formatCapitals,
  formatLanguages,
  formatCurrencies,
  formatRegion,
  formatBorders,
} from "./format.js";

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const getElement = (id) => document.getElementById(id);

function safeUrl(value) {
  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function countryFlag(country) {
  const flagUrl = safeUrl(country.flag);

  if (!flagUrl) {
    return `
      <div class="flex h-full items-center justify-center
                  bg-[#DED0B9] text-[#193A2E]">
        <i class="fa-solid fa-earth-americas text-3xl"
           aria-hidden="true"></i>
      </div>
    `;
  }

  return `
    <img
      src="${escapeHTML(flagUrl)}"
      alt="${escapeHTML(country.flagAlt || `Flag of ${country.name}`)}"
      class="h-full w-full object-cover"
      loading="lazy"
      referrerpolicy="no-referrer"
    />
  `;
}

function setText(id, value) {
  const element = getElement(id);

  if (element) {
    element.textContent = value;
  }
}

function setVisible(element, visible) {
  if (!element) return;

  element.classList.toggle("hidden", !visible);
}

function showOnlyGridState(state) {
  setVisible(getElement("loadingState"), state === "loading");
  setVisible(getElement("errorState"), state === "error");
  setVisible(getElement("emptyState"), state === "empty");
  setVisible(getElement("countryGrid"), state === "results");
}

export function renderCountryGrid(
  countries,
  favorites = [],
  compareList = []
) {
  const grid = getElement("countryGrid");

  if (!grid) return;

  if (!countries.length) {
    grid.innerHTML = "";
    showOnlyGridState("empty");
    return;
  }

  showOnlyGridState("results");

  const favoriteCodes = new Set(favorites);
  const compareCodes = new Set(compareList);

  grid.innerHTML = countries
    .map((country) => {
      const code = escapeHTML(country.code);
      const name = escapeHTML(country.name);
      const region = escapeHTML(formatRegion(country));
      const capital = escapeHTML(formatCapitals(country.capital));
      const population = escapeHTML(
        formatPopulation(country.population)
      );
      const area = escapeHTML(formatArea(country.area));

      const isFavorite = favoriteCodes.has(country.code);
      const isCompared = compareCodes.has(country.code);

      return `
        <article
          class="country-card group overflow-hidden rounded-sm
                 border border-[#DED0B9] bg-[#FBF7EF]
                 transition duration-300 hover:-translate-y-1
                 hover:shadow-xl"
          data-country-code="${code}"
        >
          <div class="relative h-48 overflow-hidden bg-[#DED0B9]">
            ${countryFlag(country)}

            <span
              class="absolute left-4 top-4 rounded-full
                     bg-[#F4EBDD]/95 px-3 py-1 text-xs
                     font-semibold uppercase tracking-wider
                     text-[#193A2E]"
            >
              ${region}
            </span>

            <button
              type="button"
              data-action="favorite"
              data-code="${code}"
              aria-label="${isFavorite
          ? `Remove ${name} from favourites`
          : `Add ${name} to favourites`}"
              aria-pressed="${isFavorite}"
              class="absolute right-4 top-4 flex h-10 w-10
                     items-center justify-center rounded-full
                     bg-[#F4EBDD]/95 text-[#193A2E]
                     transition hover:bg-[#B85F3E]
                     hover:text-white"
            >
              <i class="${isFavorite
          ? "fa-solid"
          : "fa-regular"} fa-heart"
                 aria-hidden="true"></i>
            </button>
          </div>

          <div class="p-5">
            <p class="mb-2 text-xs uppercase tracking-[0.18em]
                      text-[#B85F3E]">
              ${capital}
            </p>

            <button
              type="button"
              data-action="details"
              data-code="${code}"
              class="mb-4 block text-left font-serif text-2xl
                     text-[#193A2E] transition
                     hover:text-[#B85F3E]"
            >
              ${name}
            </button>

            <div class="grid grid-cols-2 gap-3 border-y
                        border-[#DED0B9] py-4">
              <div>
                <p class="text-xs text-[#6B7068]">Population</p>
                <p class="mt-1 font-semibold text-[#282C25]">
                  ${population}
                </p>
              </div>

              <div>
                <p class="text-xs text-[#6B7068]">Area</p>
                <p class="mt-1 font-semibold text-[#282C25]">
                  ${area}
                </p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                data-action="details"
                data-code="${code}"
                class="text-sm font-semibold text-[#193A2E]
                       hover:text-[#B85F3E]"
              >
                Explore country
                <i class="fa-solid fa-arrow-right ml-1"
                   aria-hidden="true"></i>
              </button>

              <label class="flex cursor-pointer items-center gap-2
                            text-xs text-[#6B7068]">
                <input
                  type="checkbox"
                  data-action="compare"
                  data-code="${code}"
                  ${isCompared ? "checked" : ""}
                  aria-label="Compare ${name}"
                  class="accent-[#193A2E]"
                />
                Compare
              </label>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

export function showLoading() {
  showOnlyGridState("loading");
}

export function showError(message) {
  showOnlyGridState("error");

  setText(
    "errorMessage",
    message || "Something went wrong. Please try again."
  );
}

export function showEmptyState() {
  showOnlyGridState("empty");
}

export function showResults() {
  showOnlyGridState("results");
}

export function updateResultCount(count, total = count) {
  const resultCount = getElement("resultCount");

  if (!resultCount) return;

  resultCount.textContent =
    count === total
      ? `${count} ${count === 1 ? "country" : "countries"}`
      : `${count} of ${total} countries`;
}

export function renderActiveFilters(filters = []) {
  const container = getElement("activeFilters");

  if (!container) return;

  container.innerHTML = filters
    .filter(Boolean)
    .map((filter) => `
      <span class="inline-flex items-center rounded-full
                   border border-[#DED0B9] px-3 py-1
                   text-xs text-[#193A2E]">
        ${escapeHTML(filter)}
      </span>
    `)
    .join("");
}

export function updateFavoriteCount(count) {
  setText("favoriteCount", String(count));
}

export function updateCompareBar(compareList = [], countries = []) {
  const bar = getElement("compareBar");

  if (!bar) return;

  const count = compareList.length;
  setVisible(bar, count > 0);

  setText(
    "compareSelectionText",
    `${count} of 3 countries selected`
  );

  const compareButton = getElement("compareBtn");

  if (compareButton) {
    compareButton.disabled = count < 2;
    compareButton.classList.toggle("opacity-50", count < 2);
    compareButton.classList.toggle("cursor-not-allowed", count < 2);
  }
}

export function openCountryDetails(country, allCountries = []) {
  if (!country) return;

  const modal = getElement("detailModal");
  const content = getElement("detailContent");

  if (!modal || !content) return;

  setText("detailCountryName", country.name);

  const officialName = escapeHTML(country.officialName);
  const name = escapeHTML(country.name);
  const capital = escapeHTML(formatCapitals(country.capital));
  const region = escapeHTML(formatRegion(country));
  const population = escapeHTML(formatPopulation(country.population));
  const area = escapeHTML(formatArea(country.area));
  const languages = escapeHTML(formatLanguages(country.languages));
  const currencies = escapeHTML(formatCurrencies(country.currencies));
  const borderCountries = (country.borders || [])
    .map((code) => allCountries.find((item) => item.code === code))
    .filter(Boolean);
  const flag = countryFlag(country);

  const timezones = escapeHTML(
    Array.isArray(country.timezones) && country.timezones.length
      ? country.timezones.join(", ")
      : "Not available"
  );

  const continents = escapeHTML(
    Array.isArray(country.continents) && country.continents.length
      ? country.continents.join(", ")
      : "Not available"
  );

  const nativeNames = escapeHTML(
    Array.isArray(country.nativeNames) && country.nativeNames.length
      ? [...new Set(country.nativeNames)].join(", ")
      : "Not available"
  );

  content.innerHTML = `
    <div class="grid gap-6 md:grid-cols-2">
      <div class="overflow-hidden rounded-sm bg-[#DED0B9]">
        <div class="h-56 sm:h-72">
          ${flag}
        </div>

        <div class="p-4">
          <p class="text-xs uppercase tracking-[0.2em]
                    text-[#B85F3E]">
            Official name
          </p>

          <p class="mt-2 font-serif text-xl text-[#193A2E]">
            ${officialName}
          </p>

          <p class="mt-3 text-sm leading-6 text-[#6B7068]">
            Native names: ${nativeNames}
          </p>
        </div>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.2em]
                  text-[#B85F3E]">
          Your next adventure
        </p>

        <h3 class="mt-2 font-serif text-4xl text-[#193A2E]">
          ${name}
        </h3>

        <p class="mt-3 text-sm text-[#6B7068]">
          ${region}
        </p>

        <div class="mt-6 space-y-4">
          ${detailRow("Capital", capital)}
          ${detailRow("Population", population)}
          ${detailRow("Area", area)}
          ${detailRow("Languages", languages)}
          ${detailRow("Currencies", currencies)}
<div class="border-b border-[#DED0B9] pb-3">
  <p class="text-xs uppercase tracking-wider text-[#6B7068]">
    Border Countries
  </p>

  <div class="mt-2 flex flex-wrap gap-2">
    ${borderCountries.length
      ? borderCountries.map((borderCountry) => `
            <button
              type="button"
              data-border-code="${escapeHTML(borderCountry.code)}"
              class="rounded-full border border-[#193A2E]/30
                     px-3 py-2 text-xs text-[#193A2E]
                     transition hover:bg-[#193A2E]
                     hover:text-white"
            >
              ${escapeHTML(borderCountry.name)}
            </button>
          `).join("")
      : '<span class="text-sm text-[#6B7068]">No border countries listed</span>'
    }
  </div>
</div>

          ${detailRow("Continents", continents)}
          ${detailRow("Time zones", timezones)}
          ${detailRow(
      "Independent",
      country.independent ? "Yes" : "No / not listed"
    )}
          ${detailRow(
      "Landlocked",
      country.landlocked ? "Yes" : "No"
    )}
        </div>

             <div class="mt-6">
          <a
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(country.name)}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 font-semibold text-[#193A2E] hover:text-[#B85F3E]"
          >
            View on Google Maps
            <i class="fa-solid fa-arrow-up-right-from-square"
               aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("overflow-hidden");

  const closeButton = getElement("closeDetailBtn");

  if (closeButton) {
    closeButton.focus();
  }
}

function detailRow(label, value) {
  return `
    <div class="border-b border-[#DED0B9] pb-3">
      <p class="text-xs uppercase tracking-wider text-[#6B7068]">
        ${escapeHTML(label)}
      </p>

      <p class="mt-1 break-words text-sm font-medium text-[#282C25]">
        ${escapeHTML(value)}
      </p>
    </div>
  `;
}

export function closeCountryDetails() {
  const modal = getElement("detailModal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overflow-hidden");
}

export function openComparison(countries = []) {
  if (countries.length < 2) {
    return false;
  }

  const modal = getElement("compareModal");
  const content = getElement("compareContent");

  if (!modal || !content) return false;

  setText("compareTitle", "Compare Countries");

  const rows = [
    ["Capital", (c) => formatCapitals(c.capital)],
    ["Region", (c) => formatRegion(c)],
    ["Population", (c) => formatNumberSafe(c.population)],
    ["Area", (c) => formatArea(c.area)],
    ["Languages", (c) => formatLanguages(c.languages)],
    ["Currencies", (c) => formatCurrencies(c.currencies)],
    ["Land borders", (c) => formatBorders(c.borders)],
  ];

  content.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr class="border-b-2 border-[#193A2E]">
            <th class="p-3 text-xs uppercase tracking-wider
                       text-[#6B7068]">
              Details
            </th>

            ${countries.map((country) => `
              <th class="p-3 font-serif text-lg text-[#193A2E]">
                ${escapeHTML(country.name)}
              </th>
            `).join("")}
          </tr>
        </thead>

        <tbody>
          ${rows.map(([label, getter]) => `
            <tr class="border-b border-[#DED0B9]">
              <th class="p-3 align-top text-sm font-medium
                         text-[#6B7068]">
                ${escapeHTML(label)}
              </th>

              ${countries.map((country) => `
                <td class="p-3 align-top text-sm text-[#282C25]">
                  ${escapeHTML(getter(country))}
                </td>
              `).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;


  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("overflow-hidden");

  const closeButton = getElement("closeCompareBtn");

  if (closeButton) {
    closeButton.focus();
  }

  return true;
}

function formatNumberSafe(value) {
  return new Intl.NumberFormat("en-IN").format(
    Number(value) || 0
  );
}

export function closeComparison() {
  const modal = getElement("compareModal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overflow-hidden");
}

export function showToast(message, type = "success") {
  const container = getElement("toastContainer");

  if (!container) return;

  const toast = document.createElement("div");

  const isError = type === "error";

  toast.className = `
    mb-3 flex items-center gap-3 rounded-sm border
    px-4 py-3 shadow-lg
    ${isError
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-[#DED0B9] bg-[#FBF7EF] text-[#193A2E]"}
  `;

  const icon = document.createElement("i");
  icon.className = isError
    ? "fa-solid fa-circle-exclamation"
    : "fa-solid fa-circle-check";

  icon.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.className = "text-sm";
  text.textContent = message;

  toast.append(icon, text);
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3500);
}

export function updateFooterYear() {
  setText("currentYear", String(new Date().getFullYear()));
}
