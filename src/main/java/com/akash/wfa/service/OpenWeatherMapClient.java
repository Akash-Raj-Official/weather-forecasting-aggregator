package com.akash.wfa.service;

import com.akash.wfa.exception.CityNotFoundException;
import com.akash.wfa.model.ExternalForecastResponse;
import com.akash.wfa.model.ExternalWeatherResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Service
public class OpenWeatherMapClient {

    private static final Duration TIMEOUT = Duration.ofSeconds(10);

    private final WebClient webClient;

    @Value("${openweathermap.api-key}")
    private String apiKey;

    public OpenWeatherMapClient(WebClient.Builder webClientBuilder) {
        // Configure WebClient instance
        this.webClient = webClientBuilder.baseUrl("https://api.openweathermap.org/data/2.5").build();
    }

    public ExternalWeatherResponse fetchWeatherByCity(String city) {
        return get("/weather", city, ExternalWeatherResponse.class);
    }

    // 5 day forecast in 3-hour steps
    public ExternalForecastResponse fetchForecastByCity(String city) {
        return get("/forecast", city, ExternalForecastResponse.class);
    }

    private <T> T get(String path, String city, Class<T> type) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OPENWEATHER_API_KEY is not set");
        }
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                        .path(path)
                        .queryParam("q", city)
                        .queryParam("appid", apiKey)
                        .queryParam("units", "metric") // for Celsius
                        .build())
                    .retrieve()
                    .bodyToMono(type) // Maps JSON to DTO
                    .block(TIMEOUT); // Use .block() only in the service layer for simplicity
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new CityNotFoundException(city);
            }
            throw e;
        }
    }
}
