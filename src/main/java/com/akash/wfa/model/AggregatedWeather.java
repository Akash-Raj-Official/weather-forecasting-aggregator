package com.akash.wfa.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.Instant;

@Entity
@Data
public class AggregatedWeather {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String cityName;
    private String searchKey; // normalised user query, used for cache lookups
    private Double latitude;
    private Double longitude;

    private Double temperatureCelsius;
    private Double feelsLikeCelsius;
    private Double minTemperatureCelsius;
    private Double maxTemperatureCelsius;
    private Double windSpeed; // km/h
    private Integer humidityPercentage;
    private Integer pressureHpa;
    private String conditionSummary; // e.g., "Clear sky", "Rain"
    private String conditionMain;    // e.g., "Clear", "Rain", "Clouds"
    private Integer timezoneOffsetSeconds;
    private Instant lastUpdated;
}
