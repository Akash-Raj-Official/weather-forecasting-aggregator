# Cloud-Native Weather Aggregator

A Spring Boot service that aggregates current conditions and the 5-day forecast from the
OpenWeatherMap API, caches results for 30 minutes, exposes Prometheus metrics, and serves a
web UI. It is containerised with Docker and deployed to AWS EC2 by GitHub Actions.

## Tech stack
- **Backend:** Java 17, Spring Boot 3 (Web, WebFlux `WebClient`, Data JPA), H2 (in-memory cache), Lombok
- **Observability:** Spring Boot Actuator (`/actuator/health`), Micrometer Prometheus (`/actuator/prometheus`)
- **Frontend:** HTML, CSS, vanilla JavaScript (canvas temperature graph)
- **Delivery:** Docker, GitHub Actions, GitHub Container Registry, AWS EC2

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

## Deployment (GitHub Actions → EC2)
`.github/workflows/deploy.yml` runs on every push to `main`:
1. Runs the tests (`mvn verify`).
2. Builds the Docker image and pushes it to `ghcr.io`.
3. SSHes into the EC2 instance, pulls the image and restarts the container on port 80.
4. Calls `/actuator/health` to confirm the deployment is live.

Pull requests only run the tests.

### One-time setup
1. **EC2 instance:** Amazon Linux 2023 or Ubuntu, t2.micro / t3.micro is enough.
   Security group inbound: **HTTP 80** from anywhere, **SSH 22** from anywhere (GitHub-hosted
   runners have no fixed IP; access is key-only). Attach an **Elastic IP** so the address stays the same.
2. **Install Docker on the instance:** copy `deploy/ec2-setup.sh` to it and run `bash ec2-setup.sh`.
3. **Repository secrets** (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |---|---|
   | `EC2_HOST` | Elastic IP / public DNS of the instance |
   | `EC2_USER` | `ec2-user` (Amazon Linux) or `ubuntu` (Ubuntu) |
   | `EC2_SSH_KEY` | Full contents of the instance's `.pem` private key |
   | `OPENWEATHER_API_KEY` | Your OpenWeatherMap API key |

4. Push to `main` (or run the workflow manually from the Actions tab). The app is then live at
   `http://<EC2_HOST>`.

## Project structure
```
src/main/java/com/akash/wfa/
├── controller/   REST endpoint
├── service/      OpenWeatherMap client + aggregation and caching
├── model/        Entities and DTOs
├── repository/   JPA repository (cache)
├── exception/    404 for unknown cities
└── scheduler/    Optional refresh of popular cities
src/main/resources/static/   Web UI
deploy/ec2-setup.sh          Docker install for the EC2 host
.github/workflows/deploy.yml CI/CD pipeline
```
