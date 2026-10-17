package com.akash.wfa.service;

import com.akash.wfa.model.AggregatedWeather;
import com.akash.wfa.model.ExternalForecastResponse;
import com.akash.wfa.model.ExternalWeatherResponse;
import com.akash.wfa.model.ForecastPoint;
import com.akash.wfa.model.WeatherResponseDTO;
import com.akash.wfa.repository.WeatherRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WeatherAggregationService {

    private static final long CACHE_MINUTES = 30;
    private static final int HOURLY_SLOTS = 8; // 8 x 3h = next 24 hours

    private final WeatherRepository repository;
    private final OpenWeatherMapClient externalClient;
    private final Map<String, CachedForecast> forecastCache = new ConcurrentHashMap<>();

    public WeatherAggregationService(WeatherRepository repository, OpenWeatherMapClient externalClient) {
        this.repository = repository;
        this.externalClient = externalClient;
    }

    // Current conditions plus hourly and daily forecast for one city
    public WeatherResponseDTO getWeatherReport(String city) {
        AggregatedWeather current = getAggregatedWeather(city);
        ExternalForecastResponse forecast = getForecast(city);
        int offset = current.getTimezoneOffsetSeconds() == null ? 0 : current.getTimezoneOffsetSeconds();
        return new WeatherResponseDTO(current, toHourly(forecast), toDaily(forecast, offset));
    }

    public AggregatedWeather getAggregatedWeather(String city) {
        String key = normalise(city);

        // FR-06: Try to retrieve from cache first
        Optional<AggregatedWeather> cached = repository.findTopBySearchKeyOrderByLastUpdatedDesc(key);

        // Simple cache hit check (data is less than 30 min old)
        if (cached.isPresent() && isFresh(cached.get().getLastUpdated())) {
            return cached.get();
        }

        // FR-05: Fetch and transform if cache miss/expired
        ExternalWeatherResponse rawData = externalClient.fetchWeatherByCity(city);
        AggregatedWeather aggregated = transform(rawData);
        aggregated.setSearchKey(key);

        // Save to cache and return
        return repository.save(aggregated);
    }

    private ExternalForecastResponse getForecast(String city) {
        String key = normalise(city);
        CachedForecast cached = forecastCache.get(key);
        if (cached != null && isFresh(cached.fetchedAt())) {
            return cached.data();
        }
        ExternalForecastResponse data = externalClient.fetchForecastByCity(city);
        forecastCache.put(key, new CachedForecast(data, Instant.now()));
        return data;
    }

    private AggregatedWeather transform(ExternalWeatherResponse rawData) {
        AggregatedWeather aggregated = new AggregatedWeather();
        aggregated.setCityName(rawData.getName());
        aggregated.setLatitude(rawData.getCoord().getLat());
        aggregated.setLongitude(rawData.getCoord().getLon());
        aggregated.setTemperatureCelsius(rawData.getMain().getTemp());
        aggregated.setFeelsLikeCelsius(rawData.getMain().getFeelsLike());
        aggregated.setMinTemperatureCelsius(rawData.getMain().getTempMin());
        aggregated.setMaxTemperatureCelsius(rawData.getMain().getTempMax());
        aggregated.setHumidityPercentage(rawData.getMain().getHumidity());
        aggregated.setPressureHpa(rawData.getMain().getPressure());
        aggregated.setTimezoneOffsetSeconds(rawData.getTimezone());

        if (rawData.getWind() != null && rawData.getWind().getSpeed() != null) {
            aggregated.setWindSpeed(rawData.getWind().getSpeed() * 3.6); // m/s -> km/h
        }

        if (rawData.getWeather() != null && !rawData.getWeather().isEmpty()) {
            aggregated.setConditionSummary(rawData.getWeather().get(0).getDescription());
            aggregated.setConditionMain(rawData.getWeather().get(0).getMain());
        }
        aggregated.setLastUpdated(Instant.now());
        return aggregated;
    }

    private List<ForecastPoint> toHourly(ExternalForecastResponse forecast) {
        List<ForecastPoint> points = new ArrayList<>();
        if (forecast == null || forecast.getList() == null) return points;
        for (ExternalForecastResponse.Item item : forecast.getList()) {
            if (points.size() == HOURLY_SLOTS) break;
            points.add(new ForecastPoint(item.getDt(), item.getMain().getTemp(), null,
                    percent(item.getPop()), conditionOf(item)));
        }
        return points;
    }

    // Groups 3-hour slots by the city's local calendar day into daily min / max
    private List<ForecastPoint> toDaily(ExternalForecastResponse forecast, int offsetSeconds) {
        List<ForecastPoint> days = new ArrayList<>();
        if (forecast == null || forecast.getList() == null) return days;

        ZoneOffset zone = ZoneOffset.ofTotalSeconds(offsetSeconds);
        Map<LocalDate, List<ExternalForecastResponse.Item>> byDay = new LinkedHashMap<>();
        for (ExternalForecastResponse.Item item : forecast.getList()) {
            LocalDate day = Instant.ofEpochSecond(item.getDt()).atOffset(zone).toLocalDate();
            byDay.computeIfAbsent(day, d -> new ArrayList<>()).add(item);
        }

        byDay.forEach((day, items) -> {
            double max = items.stream().mapToDouble(i -> i.getMain().getTempMax()).max().orElse(0);
            double min = items.stream().mapToDouble(i -> i.getMain().getTempMin()).min().orElse(0);
            double pop = items.stream().mapToDouble(i -> i.getPop() == null ? 0 : i.getPop()).max().orElse(0);
            // Use the slot closest to local midday to describe the day
            ExternalForecastResponse.Item midday = items.stream()
                    .min(Comparator.comparingInt(i -> Math.abs(
                            Instant.ofEpochSecond(i.getDt()).atOffset(zone).getHour() - 12)))
                    .orElse(items.get(0));
            days.add(new ForecastPoint(midday.getDt(), max, min, percent(pop), conditionOf(midday)));
        });
        return days;
    }

    private static boolean isFresh(Instant at) {
        return at != null && at.isAfter(Instant.now().minus(CACHE_MINUTES, ChronoUnit.MINUTES));
    }

    private static int percent(Double pop) {
        return pop == null ? 0 : (int) Math.round(pop * 100);
    }

    private static String conditionOf(ExternalForecastResponse.Item item) {
        return item.getWeather() == null || item.getWeather().isEmpty() ? "" : item.getWeather().get(0).getMain();
    }

    private static String normalise(String city) {
        return city.trim().toLowerCase(Locale.ROOT);
    }

    private record CachedForecast(ExternalForecastResponse data, Instant fetchedAt) {}
}
