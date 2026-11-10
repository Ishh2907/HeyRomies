# HeyRomies 🌍

**Collect moments, not just miles.**

HeyRomies is a vintage-inspired travel discovery website designed for curious explorers. Discover countries, explore useful country information, save favourites, and compare destinations — all in one place.

## ✨ Features

- **Country Explorer:** Browse countries from around the world.
- **Live Country Data:** Fetch country information using external APIs.
- **Search:** Find countries by name, capital, subregion, and region.
- **Region Filters:** Explore countries by geographical region.
- **Sorting:** Sort countries by name, population, or area.
- **Favourites:** Save your favourite countries using browser storage.
- **Country Details:** View capitals, population, area, languages, currencies, and other information.
- **Country Comparison:** Compare up to three countries.
- **Theme Toggle:** Switch between light and dark themes.
- **Trip Planner:** Discover country suggestions based on your travel interests.
- **Responsive Layout:** Explore the website on desktop and mobile screens.

## 🛠️ Technologies Used

- HTML5
- Tailwind CSS
- Vanilla JavaScript (ES Modules)
- External APIs
- Font Awesome
- Google Fonts
- Browser Local Storage

## 📁 Project Structure

```text
HeyRomies/
│
├── index.html
├── README.md
│
└── js/
    ├── api.js
    ├── format.js
    ├── storage.js
    ├── ui.js
    └── app.js
```

## 🚀 Getting Started

### 1. Download or Clone the Project

If you have cloned the repository, use:

```bash
git clone YOUR_REPOSITORY_URL
```

Alternatively, open the existing project folder in VS Code.

### 2. Open the Project

Make sure `index.html` and the `js` folder are in the same project directory.

### 3. Run the Website

For the best local development experience:

1. Open the project in VS Code.
2. Install the **Live Server** extension if you do not already have it.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

The website will open in your browser.

An internet connection is required for external APIs, fonts, CDN resources, and images.

## 🌐 APIs Used

### 1. Country Data API

Country information is retrieved from the Mledoze Countries dataset hosted on GitHub.

API URL:

https://raw.githubusercontent.com/mledoze/countries/master/countries.json

### 2. Population Data API

Population-related information is retrieved from the CountriesNow API.

API URL:

https://countriesnow.space/api/v0.1/countries/population

The availability of country information depends on these external data sources.

## 💾 Data Storage

Favourites, comparison selections, and theme preferences are saved in the browser's local storage.

These preferences are stored locally in the browser and are not synced between devices.

## ⚠️ Notes

- The Trip Planner provides inspiration and country suggestions; it does not make bookings.
- The newsletter interface requires a connected newsletter service to collect subscriptions.
- Country and population data availability depends on the external APIs.
- External images and CDN resources require an internet connection.

## 🎨 Design Concept

The website uses a vintage-inspired travel aesthetic, combining elegant serif typography, warm paper-like colours, earthy green accents, and terracotta details.

**Brand Line:** Old souls. New adventures.

---

Made for explorers who believe the journey is part of the story.