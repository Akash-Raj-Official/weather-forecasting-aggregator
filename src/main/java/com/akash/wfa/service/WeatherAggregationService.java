package com.akash.wfa.service;

import com.akash.wfa.model.AggregatedWeather;
import com.akash.wfa.model.ExternalWeatherResponse;
import com.akash.wfa.repository.WeatherRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class WeatherAggregationService {

    private final WeatherRepository repository;
    private final OpenWeatherMapClient externalClient;

    public WeatherAggregationService(WeatherRepository repository, OpenWeatherMapClient externalClient) {
        this.repository = repository;
        this.externalClient = externalClient;
    }

    public AggregatedWeather getAggregatedWeather(String city) {
        // FR-06: Try to retrieve from cache first
        Optional<AggregatedWeather> cached = repository.findTopByCityNameOrderByLastUpdatedDesc(city);

        // Simple cache hit check (e.g., data is less than 30 min old)
        if (cached.isPresent() && cached.get().getLastUpdated().isAfter(Instant.now().minus(30, ChronoUnit.MINUTES))) {
            return cached.get();
        }

        // FR-05: Fetch and transform if cache miss/expired
        ExternalWeatherResponse rawData = externalClient.fetchWeatherByCity(city);
        AggregatedWeather aggregated = transform(rawData);

        // Save to cache and return
        return repository.save(aggregated);
    }

    private AggregatedWeather transform(ExternalWeatherResponse rawData) {
        AggregatedWeather aggregated = new AggregatedWeather();
        aggregated.setCityName(rawData.getName());
        aggregated.setLatitude(rawData.getCoord().getLat());
        aggregated.setLongitude(rawData.getCoord().getLon());
        aggregated.setTemperatureCelsius(rawData.getMain().getTemp());
        aggregated.setHumidityPercentage(rawData.getMain().getHumidity());

        if (rawData.getWind() != null) {
            aggregated.setWindSpeed(rawData.getWind().getSpeed());
        }

        if (rawData.getWeather() != null && !rawData.getWeather().isEmpty()) {
            aggregated.setConditionSummary(rawData.getWeather().get(0).getDescription());
        }
        aggregated.setLastUpdated(Instant.now());
        return aggregated;
    }
}
