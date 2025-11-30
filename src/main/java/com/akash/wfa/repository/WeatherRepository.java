package com.akash.wfa.repository;

import com.akash.wfa.model.AggregatedWeather;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WeatherRepository extends JpaRepository<AggregatedWeather, Long> {
    // Custom query to find cached weather by city name
    Optional<AggregatedWeather> findTopByCityNameOrderByLastUpdatedDesc(String cityName);
}
