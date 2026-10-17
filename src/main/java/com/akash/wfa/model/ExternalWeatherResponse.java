package com.akash.wfa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class ExternalWeatherResponse {
    private Main main;
    private List<Weather> weather;
    private Coord coord;
    private Wind wind;
    private String name;
    private Integer timezone; // shift in seconds from UTC

    @Data
    public static class Main {
        private Double temp;
        @JsonProperty("feels_like")
        private Double feelsLike;
        @JsonProperty("temp_min")
        private Double tempMin;
        @JsonProperty("temp_max")
        private Double tempMax;
        private Integer humidity;
        private Integer pressure;
    }

    @Data
    public static class Weather {
        private String description;
        private String main;
    }

    @Data
    public static class Coord {
        private Double lat;
        private Double lon;
    }

    @Data
    public static class Wind {
        private Double speed; // metres per second (units=metric)
    }
}
