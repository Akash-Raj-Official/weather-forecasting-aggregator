package com.akash.wfa.model;

import lombok.Data;
import java.util.List;

// Response of the OpenWeatherMap 5 day / 3 hour forecast endpoint
@Data
public class ExternalForecastResponse {
    private List<Item> list;

    @Data
    public static class Item {
        private Long dt; // unix seconds, UTC
        private ExternalWeatherResponse.Main main;
        private List<ExternalWeatherResponse.Weather> weather;
        private Double pop; // probability of precipitation, 0..1
    }
}
