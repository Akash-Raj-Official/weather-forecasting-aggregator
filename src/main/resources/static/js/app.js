// API Configuration
const API_BASE_URL = '/api/v1/weather';
let currentUnit = 'C'; // C or F
let currentCity = 'London';
let lastData = null;  // Last API response, re-rendered when the unit changes
let chartData = null; // Store chart data for tooltip interaction

// Weather icons (stroke SVG paths) keyed by OpenWeatherMap "main" condition
const ICONS = {
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    rain: '<path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><line x1="16" y1="13" x2="16" y2="21"/>',
    storm: '<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/>',
    snow: '<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/>'
};

function iconFor(condition) {
    switch (condition) {
        case 'Clear': return ICONS.sun;
        case 'Rain':
        case 'Drizzle': return ICONS.rain;
        case 'Thunderstorm': return ICONS.storm;
        case 'Snow': return ICONS.snow;
        default: return ICONS.cloud; // Clouds, Mist, Haze, Fog, ...
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    fetchWeatherData(currentCity);
}

function setupEventListeners() {
    // Search button
    document.getElementById('searchBtn').addEventListener('click', handleSearch);

    // Enter key in search input
    document.getElementById('cityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Unit toggle
    document.getElementById('unitToggle').addEventListener('change', toggleUnit);

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Canvas hover for tooltips
    const canvas = document.getElementById('tempChart');
    canvas.addEventListener('mousemove', handleChartHover);
    canvas.addEventListener('mouseleave', hideTooltip);

    // Redraw the graph to the new width
    window.addEventListener('resize', () => lastData && drawTemperatureGraph(lastData));
}

function switchTab(tab) {
    const hourlyForecast = document.getElementById('hourlyForecast');
    const dailyForecast = document.getElementById('dailyForecast');

    if (tab === 'hourly') {
        hourlyForecast.style.display = 'flex';
        dailyForecast.style.display = 'none';
    } else {
        hourlyForecast.style.display = 'none';
        dailyForecast.style.display = 'flex';
    }
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}

function handleSearch() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();

    if (city) {
        fetchWeatherData(city);
        cityInput.value = '';
    }
}

async function fetchWeatherData(city) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}?city=${encodeURIComponent(city)}`);

        if (response.status === 404) {
            throw new Error(`City "${city}" not found. Please try another city.`);
        }
        if (!response.ok) {
            throw new Error('Unable to fetch weather data right now. Please try again shortly.');
        }

        const data = await response.json();
        currentCity = city;
        lastData = data;
        updateUI(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError(error.message);
        if (lastData) updateUI(lastData); // keep showing the previous city
    }
}

function showLoading() {
    document.getElementById('cityName').textContent = 'Loading...';
    document.getElementById('currentTemp').textContent = `--°${currentUnit}`;
}

function showError(message) {
    document.getElementById('cityName').textContent = 'Error';
    document.getElementById('currentTemp').textContent = `--°${currentUnit}`;
    alert(message);
}

// Converts a °C value to the selected unit and formats it
function fmt(celsius) {
    if (celsius === null || celsius === undefined) return `--°${currentUnit}`;
    const value = currentUnit === 'C' ? celsius : celsiusToFahrenheit(celsius);
    return `${Math.round(value)}°${currentUnit}`;
}

// Formats a unix time in the searched city's local time
function cityTime(unixSeconds, offsetSeconds, options) {
    const date = new Date((unixSeconds + (offsetSeconds || 0)) * 1000);
    return date.toLocaleString('en-US', { ...options, timeZone: 'UTC' });
}

function updateUI(data) {
    // Update city name
    document.getElementById('cityName').textContent = data.city || 'Unknown';

    // Update temperature and icon
    document.getElementById('currentTemp').textContent = fmt(data.temperature);
    document.querySelector('.weather-icon').innerHTML = iconFor(data.conditionMain);

    // Update condition
    document.getElementById('condition').textContent = capitalizeWords(data.condition || 'Unknown');
    document.getElementById('feelsLike').textContent = `Feels like ${fmt(data.feelsLike)}`;

    // Today's high / low from the forecast, falling back to current observation
    const today = data.daily && data.daily[0];
    document.getElementById('highTemp').textContent = fmt(today ? Math.max(today.temperature, data.high) : data.high);
    document.getElementById('lowTemp').textContent = fmt(today ? Math.min(today.minTemperature, data.low) : data.low);

    // Update metrics
    document.getElementById('windSpeed').textContent = `${Math.round(data.windSpeed || 0)} km/h`;
    document.getElementById('humidity').textContent = `${data.humidity ?? '--'}%`;
    document.getElementById('pressure').textContent = `${data.pressure ?? '--'} hPa`;

    drawTemperatureGraph(data);
    updateHourlyForecast(data);
    updateDailyForecast(data);
}

function toggleUnit() {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    document.getElementById('unitLabel').textContent = `°${currentUnit}`;

    // Re-render from the last response, no need to call the API again
    if (lastData) {
        updateUI(lastData);
    }
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function capitalizeWords(str) {
    return str.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

function drawTemperatureGraph(data) {
    const canvas = document.getElementById('tempChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const slots = data.hourly || [];
    if (slots.length < 2) return;

    // Next 24 hours in 3-hour steps
    const hours = slots.map(s => cityTime(s.time, data.timezoneOffset, { hour: 'numeric' }));
    const temps = slots.map(s => currentUnit === 'C' ? s.temperature : celsiusToFahrenheit(s.temperature));

    // Keep points and labels inside the canvas
    const padX = 24;
    const plotWidth = width - padX * 2;
    const plotHeight = height - 24;

    // Store chart data for tooltip interaction
    chartData = { hours, temps, padX, plotWidth, plotHeight };

    const maxTemp = Math.max(...temps) + 3;
    const minTemp = Math.min(...temps) - 3;
    const tempRange = maxTemp - minTemp;
    const xStep = plotWidth / (temps.length - 1);
    const pointX = i => padX + i * xStep;
    const pointY = t => plotHeight - ((t - minTemp) / tempRange) * plotHeight;

    // Draw grid lines
    ctx.strokeStyle = '#E8E4D6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (plotHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw gradient area under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, plotHeight);
    gradient.addColorStop(0, 'rgba(212, 165, 116, 0.3)');
    gradient.addColorStop(1, 'rgba(212, 165, 116, 0.05)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(pointX(0), plotHeight);
    temps.forEach((temp, i) => ctx.lineTo(pointX(i), pointY(temp)));
    ctx.lineTo(pointX(temps.length - 1), plotHeight);
    ctx.closePath();
    ctx.fill();

    // Draw temperature line
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 3;
    ctx.beginPath();
    temps.forEach((temp, i) => {
        if (i === 0) {
            ctx.moveTo(pointX(i), pointY(temp));
        } else {
            ctx.lineTo(pointX(i), pointY(temp));
        }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#D4A574';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    temps.forEach((temp, i) => {
        ctx.beginPath();
        ctx.arc(pointX(i), pointY(temp), 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });

    // Draw time labels below the graph
    ctx.fillStyle = '#4A4A4A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    hours.forEach((hour, i) => ctx.fillText(hour, pointX(i), height - 5));
}

function handleChartHover(event) {
    if (!chartData) return;

    const canvas = document.getElementById('tempChart');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { hours, temps, padX, plotWidth, plotHeight } = chartData;
    const xStep = plotWidth / (temps.length - 1);
    const maxTemp = Math.max(...temps) + 3;
    const minTemp = Math.min(...temps) - 3;
    const tempRange = maxTemp - minTemp;

    // Find closest point
    let closestIndex = -1;
    let minDistance = Infinity;

    temps.forEach((temp, i) => {
        const pointX = padX + i * xStep;
        const pointY = plotHeight - ((temp - minTemp) / tempRange) * plotHeight;
        const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);

        if (distance < minDistance && distance < 30) { // 30px threshold
            minDistance = distance;
            closestIndex = i;
        }
    });

    if (closestIndex !== -1) {
        showTooltip(hours[closestIndex], Math.round(temps[closestIndex]), event.clientX, event.clientY);
    } else {
        hideTooltip();
    }
}

function showTooltip(time, temp, x, y) {
    const tooltip = document.getElementById('tooltip');

    tooltip.textContent = `${time}: ${temp}°${currentUnit}`;
    tooltip.style.display = 'block';
    tooltip.style.position = 'fixed';
    tooltip.style.left = (x + 10) + 'px';
    tooltip.style.top = (y - 30) + 'px';
    tooltip.style.zIndex = '1000';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

function forecastItem(label, condition, tempText, chance) {
    const item = document.createElement('div');
    item.className = 'forecast-item';
    item.innerHTML = `
        <p class="forecast-time"></p>
        <svg class="forecast-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconFor(condition)}</svg>
        <p class="forecast-temp"></p>
        <p class="forecast-prob">☂ ${chance}%</p>
    `;
    item.querySelector('.forecast-time').textContent = label;
    item.querySelector('.forecast-temp').textContent = tempText;
    return item;
}

function updateHourlyForecast(data) {
    const forecastContainer = document.getElementById('hourlyForecast');
    forecastContainer.innerHTML = '';

    (data.hourly || []).forEach((slot, i) => {
        const label = i === 0 ? 'Next' : cityTime(slot.time, data.timezoneOffset, { hour: 'numeric' });
        forecastContainer.appendChild(
            forecastItem(label, slot.condition, fmt(slot.temperature), slot.precipitationChance));
    });
}

function updateDailyForecast(data) {
    const forecastContainer = document.getElementById('dailyForecast');
    forecastContainer.innerHTML = '';

    (data.daily || []).forEach((day, i) => {
        const label = i === 0 ? 'Today' : cityTime(day.time, data.timezoneOffset, { weekday: 'long' });
        forecastContainer.appendChild(
            forecastItem(label, day.condition, `${fmt(day.temperature)} / ${fmt(day.minTemperature)}`, day.precipitationChance));
    });
}
