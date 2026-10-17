package com.akash.wfa.model;

// One forecast entry returned to the frontend (3-hour slot or daily summary)
public record ForecastPoint(
        long time,                // unix seconds, UTC
        double temperature,       // °C (daily: max)
        Double minTemperature,    // °C, daily only
        int precipitationChance,  // percent
        String condition) {       // e.g. "Clear", "Rain"
}
