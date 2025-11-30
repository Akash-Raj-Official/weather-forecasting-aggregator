package com.akash.wfa.service;

import com.akash.wfa.model.ExternalWeatherResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class OpenWeatherMapClient {

    private final WebClient webClient;
    
    @Value("${openweathermap.api-key}")
    private String apiKey;
    
    private final String BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

    public OpenWeatherMapClient(WebClient.Builder webClientBuilder) {
        // Configure WebClient instance
        this.webClient = webClientBuilder.baseUrl(BASE_URL).build();
    }

    public ExternalWeatherResponse fetchWeatherByCity(String city) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .queryParam("q", city)
                    .queryParam("appid", apiKey)
                    .queryParam("units", "metric") // for Celsius
                    .build())
                .retrieve()
                .bodyToMono(ExternalWeatherResponse.class) // Maps JSON to DTO
                .block(); // Use .block() only in the service layer for simplicity
    }
}
