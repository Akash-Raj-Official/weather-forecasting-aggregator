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
    private Double latitude;
    private Double longitude;

    private Double temperatureCelsius;
    private Double windSpeed;
    private Integer humidityPercentage;
    private String conditionSummary; // e.g., "Clear sky", "Rain"
    private Instant lastUpdated;
}
