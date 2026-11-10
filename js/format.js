export function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-IN").format(number);
}

export function formatPopulation(population) {
  const number = Number(population);

  if (!Number.isFinite(number) || number < 0) {
    return "Not available";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

export function formatArea(area) {
  const number = Number(area);

  if (!Number.isFinite(number) || number < 0) {
    return "Not available";
  }

  return `${formatNumber(number)} km²`;
}

export function formatList(items, fallback = "Not available") {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  const values = items
    .filter((item) => item !== null && item !== undefined)
    .map((item) => String(item).trim())
    .filter(Boolean);

  return values.length > 0 ? values.join(", ") : fallback;
}

export function formatCapitals(capitals) {
  return formatList(capitals, "No capital listed");
}

export function formatLanguages(languages) {
  return formatList(languages, "Not listed");
}

export function formatCurrencies(currencies) {
  if (!Array.isArray(currencies) || currencies.length === 0) {
    return "Not listed";
  }

  return currencies
    .map((currency) => {
      const name = currency.name || currency.code || "Unknown currency";
      const code = currency.code || "";
      const symbol = currency.symbol || "";

      const details = [
        symbol,
        code,
      ].filter(Boolean).join(", ");

      return details
        ? `${name} (${details})`
        : name;
    })
    .join("; ");
}

export function formatRegion(country) {
  const region = country?.region || "Other";
  const subregion = country?.subregion;

  if (!subregion || subregion === "Not available") {
    return region;
  }

  return `${region} · ${subregion}`;
}

export function formatBorders(borders) {
  return formatList(borders, "No land borders");
}

export function getCountryInitials(name = "") {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "??";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] + words[words.length - 1][0]
  ).toUpperCase();
}

export function normalizeSearchText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
