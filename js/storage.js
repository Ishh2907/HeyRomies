const FAVORITES_KEY = "heyromies_favorites";
const COMPARE_KEY = "heyromies_compare";
const THEME_KEY = "heyromies_theme";

function readData(key, defaultValue) {
  try {
    const savedData = localStorage.getItem(key);

    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error("Storage read error:", error);
    return defaultValue;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Storage save error:", error);
    return false;
  }
}

export function getFavorites() {
  const favorites = readData(FAVORITES_KEY, []);
  return Array.isArray(favorites) ? favorites : [];
}

export function toggleFavorite(countryCode) {
  const favorites = getFavorites();

  const updatedFavorites = favorites.includes(countryCode)
    ? favorites.filter((code) => code !== countryCode)
    : [...favorites, countryCode];

  saveData(FAVORITES_KEY, updatedFavorites);

  return updatedFavorites;
}

export function clearFavorites() {
  saveData(FAVORITES_KEY, []);
}

export function getCompareList() {
  const compareList = readData(COMPARE_KEY, []);
  return Array.isArray(compareList) ? compareList : [];
}

export function addToCompare(countryCode) {
  const compareList = getCompareList();

  if (compareList.includes(countryCode)) {
    return compareList;
  }

  if (compareList.length >= 3) {
    return compareList;
  }

  const updatedList = [...compareList, countryCode];

  saveData(COMPARE_KEY, updatedList);

  return updatedList;
}

export function removeFromCompare(countryCode) {
  const updatedList = getCompareList().filter(
    (code) => code !== countryCode
  );

  saveData(COMPARE_KEY, updatedList);

  return updatedList;
}

export function clearCompare() {
  saveData(COMPARE_KEY, []);
}

export function getTheme() {
  const theme = readData(THEME_KEY, "light");

  return theme === "dark" ? "dark" : "light";
}

export function saveTheme(theme) {
  if (theme !== "light" && theme !== "dark") {
    return false;
  }

  return saveData(THEME_KEY, theme);
}
