package com.akash.wfa.model;

import lombok.Data;
import java.util.List;

@Data
public class ExternalWeatherResponse {
    private Main main;
    private List<Weather> weather;
    private Coord coord;
    private Wind wind;
    private String name;

    @Data
    public static class Main {
        private Double temp;
        private Integer humidity;
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
        private Double speed;
    }
}
