package com.akash.wfa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WeatherForecastAggregatorApplication {

	public static void main(String[] args) {
		SpringApplication.run(WeatherForecastAggregatorApplication.class, args);
	}

}
