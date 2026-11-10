const API_URL =
    "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";

const POPULATION_URL =
    "https://countriesnow.space/api/v0.1/countries/population";

function formatCountry(country, populationData) {
    const code = country.cca3 || country.cca2 || "";
    const iso2 = country.cca2 || "";

    const populationCountry = populationData.find(
        item =>
            item.iso3?.toUpperCase() === code.toUpperCase() ||
            item.code?.toUpperCase() === iso2.toUpperCase()
    );

    const populationCounts = populationCountry?.populationCounts || [];
    const latestPopulation = populationCounts.length
        ? Number(populationCounts[populationCounts.length - 1].value)
        : null;

    return {
        name: country.name?.common || country.name?.official || "Unknown",
        officialName: country.name?.official || "Unknown",
        code,
        flag: iso2
            ? `https://flagcdn.com/w320/${iso2.toLowerCase()}.png`
            : "",
        flagAlt: `Flag of ${country.name?.common || "country"}`,
        capital: country.capital || [],
        region: country.region || "Other",
        subregion: country.subregion || "Not available",
        population: latestPopulation,
        area: country.area ?? null,
        languages: Object.values(country.languages || {}),
        currencies: Object.entries(country.currencies || {}).map(
            ([code, currency]) => ({
                code,
                name: currency.name || code,
                symbol: currency.symbol || ""
            })
        ),
        borders: country.borders || [],
        maps: {},
        mapUrl: "",
        timezones: [],
        continents: country.continents || [],
        independent: country.independent ?? null,
        landlocked: country.landlocked ?? false
    };
}
export async function fetchCountries() {
    try {
        const countryResponse = await fetch(API_URL);

        if (!countryResponse.ok) {
            throw new Error("Country data could not load");
        }

        const countries = await countryResponse.json();

        let populationData = [];

        try {
            const populationResponse = await fetch(POPULATION_URL);

            if (populationResponse.ok) {
                const populationResult = await populationResponse.json();
                populationData = populationResult.data || [];
            }
        } catch (populationError) {
            console.warn(
                "Population data unavailable. Loading countries without it."
            );
        }

        return countries
            .map(country => formatCountry(country, populationData))
            .sort((a, b) => a.name.localeCompare(b.name));

    } catch (error) {
        console.error("HeyRomies API Error:", error);

        throw new Error(
            "Country data load nahi hua. Internet check karke Retry karo."
        );
    }
}