# Weather Forecasting Aggregator

A Spring Boot application that aggregates weather data from multiple sources to provide comprehensive weather forecasts.

## Features

- **Multi-Source Weather Data**: Fetches weather information from multiple weather APIs
- **Data Aggregation**: Combines and averages weather data for more accurate forecasts
- **Caching**: Implements Redis caching to improve performance and reduce API calls
- **REST API**: Exposes weather data through a clean RESTful API
- **Responsive Web Interface**: Beautiful, user-friendly web UI with weather visualizations
- **Temperature Graphs**: Visual representation of temperature trends
- **Wind Speed Information**: Displays wind speed data alongside temperature

## Technology Stack

### Backend
- **Java 17**
- **Spring Boot** - Application framework
- **Spring Web** - REST API
- **Spring Data Redis** - Caching layer
- **Lombok** - Reduce boilerplate code
- **Maven** - Build and dependency management

### Frontend
- **HTML5**
- **CSS3** - Modern responsive design
- **JavaScript** - Interactive UI and API integration

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Redis Server (optional, for caching)
- OpenWeatherMap API key

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/weather-forecasting-aggregator.git
cd weather-forecasting-aggregator
```

### 2. Configure API Keys

Edit `src/main/resources/application.properties` and add your OpenWeatherMap API key:

```properties
weather.api.openweathermap.key=YOUR_API_KEY_HERE
```

### 3. Build the Project

```bash
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Endpoints

### Get Weather Data
```
GET /api/weather?location={city_name}
```

**Example:**
```bash
curl http://localhost:8080/api/weather?location=London
```

**Response:**
```json
{
  "location": "London",
  "temperature": 15.5,
  "humidity": 65,
  "windSpeed": 12.5,
  "description": "Partly cloudy",
  "timestamp": "2025-11-30T12:00:00"
}
```

## Project Structure

```
weather-forecasting-aggregator/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/akash/wfa/
│   │   │       ├── controller/     # REST controllers
│   │   │       ├── model/          # Data models
│   │   │       ├── service/        # Business logic
│   │   │       └── config/         # Configuration classes
│   │   └── resources/
│   │       ├── static/             # Frontend files
│   │       │   ├── index.html
│   │       │   ├── css/
│   │       │   └── js/
│   │       └── application.properties
│   └── test/                       # Test files
├── pom.xml
└── README.md
```

## Configuration

The application can be configured through `application.properties`:

```properties
# Server Configuration
server.port=8080

# Redis Configuration (optional)
spring.redis.host=localhost
spring.redis.port=6379

# Weather API Keys
weather.api.openweathermap.key=your_key_here

# Cache Configuration
spring.cache.type=redis
spring.cache.redis.time-to-live=600000
```

## Development

### Running Tests
```bash
mvn test
```

### Building for Production
```bash
mvn clean package
java -jar target/weather-forecasting-aggregator-0.0.1-SNAPSHOT.jar
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Built with Spring Boot framework
- UI design inspired by modern weather applications

## Contact

For questions or feedback, please open an issue on GitHub.
