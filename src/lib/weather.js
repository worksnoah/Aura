function getWeatherDescription(code) {
  const map = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm"
  };

  return map[code] || "Unknown";
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 1000 * 60 * 15
    });
  });
}

export async function fetchWeather() {
  const position = await getCurrentPosition();
  const { latitude, longitude } = position.coords;

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,weather_code` +
    `&temperature_unit=fahrenheit`;

  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather");
  }

  const weatherData = await weatherResponse.json();

  const geoUrl =
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}` +
    `&longitude=${longitude}&language=en&format=json`;

  const geoResponse = await fetch(geoUrl);
  let placeName = "Your area";

  if (geoResponse.ok) {
    const geoData = await geoResponse.json();
    const result = geoData?.results?.[0];
    if (result?.name) {
      placeName = result.name;
    }
  }

  return {
    tempF: weatherData.current.temperature_2m,
    condition: getWeatherDescription(weatherData.current.weather_code),
    name: placeName
  };
}