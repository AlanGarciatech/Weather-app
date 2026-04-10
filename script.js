// Función para asignar íconos según el código de clima
function getWeatherIcon(code) {
  if (code === 0) return '<i class="fa-solid fa-sun weather-icon sun"></i>';
  if (code === 1 || code === 2) return '<i class="fa-solid fa-cloud-sun weather-icon"></i>';
  if (code === 3) return '<i class="fa-solid fa-cloud weather-icon"></i>';
  if (code >= 45 && code <= 48) return '<i class="fa-solid fa-smog weather-icon"></i>';
  if (code >= 51 && code <= 67) return '<i class="fa-solid fa-cloud-rain weather-icon rain"></i>';
  if (code >= 71 && code <= 77) return '<i class="fa-solid fa-snowflake weather-icon"></i>';
  if (code >= 80 && code <= 82) return '<i class="fa-solid fa-cloud-showers-heavy weather-icon rain"></i>';
  if (code >= 95 && code <= 99) return '<i class="fa-solid fa-bolt weather-icon bolt"></i>';
  return '<i class="fa-solid fa-question weather-icon"></i>';
}

// Función principal para obtener clima y pronóstico
async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Por favor ingresa una ciudad");
    return;
  }

  try {
    // 1. Obtener coordenadas
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      document.getElementById("weatherResult").innerHTML = "<p>Ciudad no encontrada</p>";
      document.getElementById("forecastResult").innerHTML = "";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Obtener clima actual y pronóstico extendido
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    const weather = weatherData.current_weather;

    // Ícono dinámico para clima actual
    const icon = getWeatherIcon(weather.weathercode);

    // Mostrar clima actual
    document.getElementById("weatherResult").innerHTML = `
      <h2>${name}, ${country}</h2>
      ${icon}
      <p>🌡 Temperatura: ${weather.temperature} °C</p>
      <p>💨 Viento: ${weather.windspeed} km/h</p>
      <p>⏱ Hora: ${weather.time}</p>
    `;

    // Mostrar pronóstico extendido
    const forecastDays = weatherData.daily.time;
    const maxTemps = weatherData.daily.temperature_2m_max;
    const minTemps = weatherData.daily.temperature_2m_min;
    const codes = weatherData.daily.weathercode;

    let forecastHTML = "";
    for (let i = 0; i < forecastDays.length; i++) {
      const dayIcon = getWeatherIcon(codes[i]);
      forecastHTML += `
        <div class="forecast-day">
          <h3>${forecastDays[i]}</h3>
          ${dayIcon}
          <p>Máx: ${maxTemps[i]} °C</p>
          <p>Mín: ${minTemps[i]} °C</p>
        </div>
      `;
    }

    document.getElementById("forecastResult").innerHTML = forecastHTML;

  } catch (error) {
    console.error(error);
    document.getElementById("weatherResult").innerHTML = "<p>Error al obtener el clima</p>";
    document.getElementById("forecastResult").innerHTML = "";
  }
}

// --- MODO OSCURO AUTOMÁTICO ---
function activarModoOscuroAutomatico() {
  const hora = new Date().getHours();
  const body = document.body;
  const appContainer = document.querySelector(".app-container");
  const weatherCard = document.querySelector(".weather-card");
  const forecastDays = document.querySelectorAll(".forecast-day");

  if (hora >= 19 || hora < 6) {
    body.classList.add("dark-mode");
    appContainer.classList.add("dark-mode");
    if (weatherCard) weatherCard.classList.add("dark-mode");
    forecastDays.forEach(day => day.classList.add("dark-mode"));
  } else {
    body.classList.remove("dark-mode");
    appContainer.classList.remove("dark-mode");
    if (weatherCard) weatherCard.classList.remove("dark-mode");
    forecastDays.forEach(day => day.classList.remove("dark-mode"));
  }
}

// Ejecutar modo oscuro automático al cargar la página
window.onload = activarModoOscuroAutomatico;