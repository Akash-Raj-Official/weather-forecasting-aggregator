package com.akash.wfa.controller;

import com.akash.wfa.model.WeatherResponseDTO;
import com.akash.wfa.service.WeatherAggregationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/weather")
@CrossOrigin(origins = "*") // Allow all origins for testing
public class WeatherController {

    private final WeatherAggregationService service;

    public WeatherController(WeatherAggregationService service) {
        this.service = service;
    }

    // FR-02: Endpoint to fetch weather by city name
    @GetMapping
    public WeatherResponseDTO getWeatherByCity(@RequestParam String city) {
        if (city.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "city must not be blank");
        }
        // Current conditions + hourly / daily forecast
        return service.getWeatherReport(city);
    }
}
