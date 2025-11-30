# 🌦️ Weather Forecast Aggregator - Quick Start Guide

## Prerequisites
✅ **Java 17 or higher** installed  
✅ **Maven** installed  
✅ **OpenWeatherMap API Key** (already configured in `application.properties`)

---

## 🚀 Steps to Run the Application

### 1️⃣ Open Terminal/Command Prompt
Navigate to the project directory:
```bash
cd "d:\Weather Forcasting Aggregator"
```

### 2️⃣ Build and Run the Application
Execute the following command:
```bash
mvn spring-boot:run
```

**Wait for the message:**
```
Started WeatherForecastAggregatorApplication in X seconds
```

### 3️⃣ Open Your Browser
Navigate to:
```
http://localhost:8080
```

---

## 🎯 How to Demonstrate

### Step 1: Show the Homepage
- **Point out** the beautiful beige/cream themed design
- **Highlight** the date/time display at the top
- **Show** the temperature unit toggle (°C/°F)

### Step 2: Search for a City
1. **Type** a city name in the search box (e.g., "London", "New York", "Paris")
2. **Click** the "Search" button or press **Enter**
3. **Watch** the weather data load in real-time

### Step 3: Explain the Current Weather Card
- **Large temperature display** with animated sun icon
- **Weather condition** (e.g., "Clear sky", "Clouds")
- **High/Low temperatures** for the day
- **"Feels like"** temperature

### Step 4: Show the Weather Metrics
Point out the three key metrics:
- 🌬️ **Wind Speed** (real data from API)
- 💧 **Humidity** (real data from API)
- ☀️ **UV Index** (mock data)

### Step 5: Demonstrate the Temperature Graph
- **Show** the smooth line chart showing temperature trends
- **Explain** it displays hourly temperature changes
- **Point out** the gradient fill and data points

### Step 6: Browse the Hourly Forecast
- **Scroll** through the hourly forecast strip at the bottom
- **Show** temperature predictions for next 12 hours
- **Highlight** the precipitation probability for each hour

### Step 7: Toggle Temperature Units
- **Click** the toggle switch at the top-right
- **Show** how temperatures convert from °C to °F instantly

### Step 8: Search Multiple Cities
Try different cities to show the aggregator in action:
- **Tokyo** (Asian city)
- **Mumbai** (Indian city)
- **Berlin** (European city)
- **Sydney** (Australian city)

---

## 🎤 Demonstration Script (30 seconds)

> "This is a Weather Forecast Aggregator built with Spring Boot. Let me search for London...
> 
> As you can see, it fetches real-time weather data from OpenWeatherMap API. Here's the current temperature, humidity, and wind speed. 
> 
> The temperature graph shows hourly trends, and we have a 12-hour forecast below. 
> 
> I can switch between Celsius and Fahrenheit instantly. 
> 
> The backend caches data for 30 minutes and automatically refreshes weather for major cities every 30 minutes using a scheduler. 
> 
> Let me try another city... Paris... and the data updates instantly!"

---

## 🛑 How to Stop the Application

Press **`Ctrl + C`** in the terminal where the application is running.

---

## 🐛 Troubleshooting

### Issue: Port 8080 already in use
**Solution:** Stop existing applications on port 8080 or change the port in `application.properties`:
```properties
server.port=8081
```

### Issue: API returns error
**Solution:** Check your OpenWeatherMap API key in `src/main/resources/application.properties`

### Issue: City not found
**Solution:** Try a major city name in English (e.g., "London", "Paris", "Tokyo")

---

## 📁 Project Structure Overview

```
Weather Forecast Aggregator/
├── src/main/java/com/akash/wfa/
│   ├── controller/        # REST API endpoints
│   ├── service/          # Business logic & API clients
│   ├── model/            # Data models & DTOs
│   ├── repository/       # Database access
│   └── scheduler/        # Scheduled tasks
├── src/main/resources/
│   ├── static/           # Frontend files (HTML/CSS/JS)
│   └── application.properties  # Configuration
└── pom.xml              # Maven dependencies
```

---

## ✨ Key Features to Highlight

1. **Real-time Weather Data** from OpenWeatherMap API
2. **Automatic Caching** (30-minute cache for performance)
3. **Scheduled Refresh** (Updates major cities every 30 minutes)
4. **Beautiful UI** with beige/cream theme
5. **Interactive Graphs** using HTML5 Canvas
6. **RESTful API** structure
7. **Spring Boot** best practices
8. **Responsive Design** (works on mobile too!)

---

**Made with ❤️ by Akash**
