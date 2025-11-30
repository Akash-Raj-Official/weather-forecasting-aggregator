package com.akash.wfa.scheduler;

import com.akash.wfa.service.WeatherAggregationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class WeatherScheduler {

    private final WeatherAggregationService service;
    private final List<String> highPriorityCities = List.of("New York", "London", "Tokyo"); // FR-04

    public WeatherScheduler(WeatherAggregationService service) {
        this.service = service;
    }

    // FR-04: Runs every 30 minutes (30 * 60 * 1000 milliseconds)
    // @Scheduled(fixedRate = 1800000) // Temporarily disabled
    public void refreshHighPriorityWeather() {
        System.out.println("Starting scheduled weather refresh...");
        for (String city : highPriorityCities) {
            try {
                service.getAggregatedWeather(city); // This triggers the fetch and cache update
                System.out.println("Refreshed weather for: " + city);
            } catch (Exception e) {
                // Log the error but continue the loop
                System.err.println("Failed to fetch weather for " + city + ": " + e.getMessage());
            }
        }
    }
}
