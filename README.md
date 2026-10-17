# Cloud-Native Weather Aggregator

A Spring Boot service that aggregates current conditions and the 5-day forecast from the
OpenWeatherMap API, caches results for 30 minutes, exposes Prometheus metrics, and serves a
web UI. It is containerised with Docker, and its web UI is published to GitHub Pages by GitHub Actions.

## Tech stack
- **Backend:** Java 17, Spring Boot 3 (Web, WebFlux `WebClient`, Data JPA), H2 (in-memory cache), Lombok
- **Observability:** Spring Boot Actuator (`/actuator/health`), Micrometer Prometheus (`/actuator/prometheus`)
- **Frontend:** HTML, CSS, vanilla JavaScript (canvas temperature graph)
- **Delivery:** Docker, GitHub Actions, GitHub Pages

## API
```
GET /api/v1/weather?city={city}
```
Returns current conditions (temperature, feels like, high/low, wind in km/h, humidity, pressure)
plus `hourly` (next 24 h in 3-hour steps) and `daily` (5 days, min/max) forecasts.
Unknown cities return `404`.

## Run locally
Requires Java 17+ and Maven, plus a free OpenWeatherMap API key.

```bash
export OPENWEATHER_API_KEY=your_key      # PowerShell: $env:OPENWEATHER_API_KEY="your_key"
mvn spring-boot:run
```
Open http://localhost:8080.

Or with Docker:
```bash
docker build -t wfa .
docker run -p 8080:8080 -e OPENWEATHER_API_KEY=your_key wfa
```

## Live site (GitHub Pages)
The web UI is deployed as a static site to GitHub Pages by `.github/workflows/pages.yml`
on every push to `main`: it runs the backend tests (`mvn verify`), then publishes
`src/main/resources/static`.

The static site fetches data directly from the free [Open-Meteo](https://open-meteo.com) geocoding
and forecast APIs, so it needs no server and no API key. The Spring Boot service above is the
backend version of the same aggregator and can be run locally or in Docker.

**One-time setup:** repository Settings → Pages → Build and deployment → Source: **GitHub Actions**.

## Project structure
```
src/main/java/com/akash/wfa/
├── controller/   REST endpoint
├── service/      OpenWeatherMap client + aggregation and caching
├── model/        Entities and DTOs
├── repository/   JPA repository (cache)
├── exception/    404 for unknown cities
└── scheduler/    Optional refresh of popular cities
src/main/resources/static/   Web UI (static, uses Open-Meteo)
.github/workflows/pages.yml  CI/CD: tests + GitHub Pages deploy
```
