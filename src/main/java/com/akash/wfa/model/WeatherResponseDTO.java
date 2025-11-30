package com.akash.wfa.model;

import lombok.Data;

@Data
public class WeatherResponseDTO {
    private String city;
    private Double temperature;
    private Double windSpeed;
    private Integer humidity;
    private String condition;

    public WeatherResponseDTO(AggregatedWeather weather) {
        this.city = weather.getCityName();
        this.temperature = weather.getTemperatureCelsius();
        this.windSpeed = weather.getWindSpeed();
        this.humidity = weather.getHumidityPercentage();
        this.condition = weather.getConditionSummary();
    }
}
