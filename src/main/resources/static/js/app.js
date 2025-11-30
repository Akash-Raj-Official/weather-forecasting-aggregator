// API Configuration
const API_BASE_URL = '/api/v1/weather';
let currentUnit = 'C'; // C or F
let currentCity = 'London';
let chartData = null; // Store chart data for tooltip interaction

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
        currentCity = city;
        fetchWeatherData(city);
        cityInput.value = '';
    }
}

async function fetchWeatherData(city) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError('Unable to fetch weather data. Please try another city.');
    }
}

function showLoading() {
    document.getElementById('cityName').textContent = 'Loading...';
    document.getElementById('currentTemp').textContent = '--°C';
}

function showError(message) {
    document.getElementById('cityName').textContent = 'Error';
    document.getElementById('currentTemp').textContent = '--°C';
    alert(message);
}

function updateUI(data) {
    // Update city name
    document.getElementById('cityName').textContent = data.city || 'Unknown';

    // Update temperature
    const temp = data.temperature;
    const displayTemp = currentUnit === 'C' ? temp : celsiusToFahrenheit(temp);
    document.getElementById('currentTemp').textContent = `${Math.round(displayTemp)}°${currentUnit}`;

    // Update condition
    document.getElementById('condition').textContent = capitalizeWords(data.condition || 'Unknown');

    // Update feels like (using same temp for now as we don't have feels_like from API)
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(displayTemp)}°${currentUnit}`;

    // Update high/low (mock data - using ±5 from current temp)
    document.getElementById('highTemp').textContent = `${Math.round(displayTemp + 5)}°${currentUnit}`;
    document.getElementById('lowTemp').textContent = `${Math.round(displayTemp - 5)}°${currentUnit}`;

    // Update wind speed
    const windSpeed = data.windSpeed || 0;
    document.getElementById('windSpeed').textContent = `${Math.round(windSpeed)} km/h`;

    // Update humidity
    document.getElementById('humidity').textContent = `${data.humidity || 0}%`;

    // Update UV Index (mock data as we don't have it from API)
    document.getElementById('uvIndex').textContent = `${Math.floor(Math.random() * 10 + 1)}/10`;

    // Draw temperature graph
    drawTemperatureGraph(displayTemp);

    // Update hourly forecast
    updateHourlyForecast(displayTemp);

    // Update daily forecast
    updateDailyForecast(displayTemp);
}

function toggleUnit() {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    document.getElementById('unitLabel').textContent = `°${currentUnit}`;

    // Re-fetch and update display
    if (currentCity) {
        fetchWeatherData(currentCity);
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

function drawTemperatureGraph(currentTemp) {
    const canvas = document.getElementById('tempChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Mock temperature data for the day (8AM - 9PM)
    const hours = ['8AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
    const temps = [
        currentTemp - 5,
        currentTemp - 3,
        currentTemp + 3,
        currentTemp + 5,
        currentTemp + 2,
        currentTemp - 2
    ];

    // Store chart data for tooltip interaction
    chartData = {
        hours: hours,
        temps: temps,
        width: width,
        height: height
    };

    const maxTemp = Math.max(...temps) + 5;
    const minTemp = Math.min(...temps) - 5;
    const tempRange = maxTemp - minTemp;

    // Draw grid lines
    ctx.strokeStyle = '#E8E4D6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw gradient area under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(212, 165, 116, 0.3)');
    gradient.addColorStop(1, 'rgba(212, 165, 116, 0.05)');

    ctx.fillStyle = gradient;
    ctx.beginPath();

    const xStep = width / (temps.length - 1);

    // Start from bottom left
    ctx.moveTo(0, height);

    temps.forEach((temp, i) => {
        const x = i * xStep;
        const y = height - ((temp - minTemp) / tempRange) * height;
        ctx.lineTo(x, y);
    });

    // Close the path to bottom right
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Draw temperature line
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 3;
    ctx.beginPath();

    temps.forEach((temp, i) => {
        const x = i * xStep;
        const y = height - ((temp - minTemp) / tempRange) * height;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#D4A574';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    temps.forEach((temp, i) => {
        const x = i * xStep;
        const y = height - ((temp - minTemp) / tempRange) * height;

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });

    // Draw time labels below the graph
    ctx.fillStyle = '#4A4A4A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';

    hours.forEach((hour, i) => {
        const x = i * xStep;
        ctx.fillText(hour, x, height - 5);
    });
}

function handleChartHover(event) {
    if (!chartData) return;

    const canvas = document.getElementById('tempChart');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { hours, temps, width, height } = chartData;
    const xStep = width / (temps.length - 1);

    // Find closest point
    let closestIndex = -1;
    let minDistance = Infinity;

    const maxTemp = Math.max(...temps) + 5;
    const minTemp = Math.min(...temps) - 5;
    const tempRange = maxTemp - minTemp;

    temps.forEach((temp, i) => {
        const pointX = i * xStep;
        const pointY = height - ((temp - minTemp) / tempRange) * height;
        const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);

        if (distance < minDistance && distance < 30) { // 30px threshold
            minDistance = distance;
            closestIndex = i;
        }
    });

    if (closestIndex !== -1) {
        showTooltip(
            hours[closestIndex],
            Math.round(temps[closestIndex]),
            event.clientX,
            event.clientY
        );
    } else {
        hideTooltip();
    }
}

function showTooltip(time, temp, x, y) {
    const tooltip = document.getElementById('tooltip');
    const canvas = document.getElementById('tempChart');
    const rect = canvas.getBoundingClientRect();

    tooltip.textContent = `${time}: ${temp}°${currentUnit}`;
    tooltip.style.display = 'block';
    tooltip.style.position = 'fixed';
    tooltip.style.left = (rect.left + x + 10) + 'px';
    tooltip.style.top = (rect.top + y - 30) + 'px';
    tooltip.style.zIndex = '1000';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

function updateHourlyForecast(currentTemp) {
    const forecastContainer = document.getElementById('hourlyForecast');
    forecastContainer.innerHTML = '';

    const now = new Date();
    const hours = [];

    for (let i = 0; i < 12; i++) {
        const hourTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        const hourStr = i === 0 ? 'Now' : hourTime.toLocaleTimeString('en-US', { hour: 'numeric' });
        const tempVariation = Math.sin(i / 2) * 5;
        const rainProb = Math.max(0, Math.min(50, i * 4));

        hours.push({
            time: hourStr,
            temp: currentTemp + tempVariation,
            prob: rainProb
        });
    }

    hours.forEach(hour => {
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <p class="forecast-time">${hour.time}</p>
            <svg class="forecast-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <p class="forecast-temp">${Math.round(hour.temp)}°${currentUnit}</p>
            <p class="forecast-prob">☂ ${Math.round(hour.prob)}%</p>
        `;
        forecastContainer.appendChild(item);
    });
}

function updateDailyForecast(currentTemp) {
    const forecastContainer = document.getElementById('dailyForecast');
    forecastContainer.innerHTML = '';

    const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const forecasts = [];

    for (let i = 0; i < 7; i++) {
        const tempVariation = Math.cos(i / 3) * 8;
        const rainProb = Math.max(0, Math.min(80, 10 + i * 10));

        forecasts.push({
            day: days[i],
            temp: currentTemp + tempVariation,
            prob: rainProb
        });
    }

    forecasts.forEach(forecast => {
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <p class="forecast-time">${forecast.day}</p>
            <svg class="forecast-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <p class="forecast-temp">${Math.round(forecast.temp)}°${currentUnit}</p>
            <p class="forecast-prob">☂ ${Math.round(forecast.prob)}%</p>
        `;
        forecastContainer.appendChild(item);
    });
}
