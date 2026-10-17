package com.akash.wfa.model;

import lombok.Data;
import java.util.List;

@Data
public class WeatherResponseDTO {
    private String city;
    private Double temperature;
    private Double feelsLike;
    private Double high;
    private Double low;
    private Double windSpeed; // km/h
    private Integer humidity;
    private Integer pressure;
    private String condition;
    private String conditionMain;
    private Integer timezoneOffset; // seconds from UTC
    private List<ForecastPoint> hourly;
    private List<ForecastPoint> daily;

    public WeatherResponseDTO(AggregatedWeather weather, List<ForecastPoint> hourly, List<ForecastPoint> daily) {
        this.city = weather.getCityName();
        this.temperature = weather.getTemperatureCelsius();
        this.feelsLike = weather.getFeelsLikeCelsius();
        this.high = weather.getMaxTemperatureCelsius();
        this.low = weather.getMinTemperatureCelsius();
        this.windSpeed = weather.getWindSpeed();
        this.humidity = weather.getHumidityPercentage();
        this.pressure = weather.getPressureHpa();
        this.condition = weather.getConditionSummary();
        this.conditionMain = weather.getConditionMain();
        this.timezoneOffset = weather.getTimezoneOffsetSeconds();
        this.hourly = hourly;
        this.daily = daily;
    }
}
