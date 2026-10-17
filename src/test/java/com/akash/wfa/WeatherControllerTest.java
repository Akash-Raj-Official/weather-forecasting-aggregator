package com.akash.wfa;

import com.akash.wfa.exception.CityNotFoundException;
import com.akash.wfa.model.ExternalForecastResponse;
import com.akash.wfa.model.ExternalWeatherResponse;
import com.akash.wfa.service.OpenWeatherMapClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WeatherControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private OpenWeatherMapClient client;

    @Test
    void returnsCurrentWeatherAndForecast() throws Exception {
        when(client.fetchWeatherByCity(anyString())).thenReturn(current());
        when(client.fetchForecastByCity(anyString())).thenReturn(forecast());

        mvc.perform(get("/api/v1/weather").param("city", "London"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.city").value("London"))
                .andExpect(jsonPath("$.temperature").value(18.5))
                .andExpect(jsonPath("$.windSpeed").value(36.0)) // 10 m/s -> 36 km/h
                .andExpect(jsonPath("$.hourly", hasSize(8)))
                .andExpect(jsonPath("$.daily[0].minTemperature").exists());

        // Second request with different casing is served from cache
        mvc.perform(get("/api/v1/weather").param("city", " london ")).andExpect(status().isOk());
        verify(client, times(1)).fetchWeatherByCity(anyString());
        verify(client, times(1)).fetchForecastByCity(anyString());
    }

    @Test
    void unknownCityReturns404() throws Exception {
        when(client.fetchWeatherByCity("Atlantis")).thenThrow(new CityNotFoundException("Atlantis"));

        mvc.perform(get("/api/v1/weather").param("city", "Atlantis"))
                .andExpect(status().isNotFound());
    }

    @Test
    void healthEndpointIsUp() throws Exception {
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    private static ExternalWeatherResponse current() {
        ExternalWeatherResponse r = new ExternalWeatherResponse();
        r.setName("London");
        r.setTimezone(3600);
        ExternalWeatherResponse.Coord coord = new ExternalWeatherResponse.Coord();
        coord.setLat(51.5);
        coord.setLon(-0.12);
        r.setCoord(coord);
        r.setMain(main(18.5));
        ExternalWeatherResponse.Wind wind = new ExternalWeatherResponse.Wind();
        wind.setSpeed(10.0);
        r.setWind(wind);
        r.setWeather(List.of(weather()));
        return r;
    }

    private static ExternalForecastResponse forecast() {
        List<ExternalForecastResponse.Item> items = new ArrayList<>();
        long start = 1_760_000_000L;
        for (int i = 0; i < 40; i++) { // 5 days x 8 slots
            ExternalForecastResponse.Item item = new ExternalForecastResponse.Item();
            item.setDt(start + i * 3 * 3600L);
            item.setMain(main(10 + i % 8));
            item.setPop(0.2);
            item.setWeather(List.of(weather()));
            items.add(item);
        }
        ExternalForecastResponse f = new ExternalForecastResponse();
        f.setList(items);
        return f;
    }

    private static ExternalWeatherResponse.Main main(double temp) {
        ExternalWeatherResponse.Main m = new ExternalWeatherResponse.Main();
        m.setTemp(temp);
        m.setFeelsLike(temp - 1);
        m.setTempMin(temp - 2);
        m.setTempMax(temp + 2);
        m.setHumidity(60);
        m.setPressure(1012);
        return m;
    }

    private static ExternalWeatherResponse.Weather weather() {
        ExternalWeatherResponse.Weather w = new ExternalWeatherResponse.Weather();
        w.setMain("Clouds");
        w.setDescription("scattered clouds");
        return w;
    }
}
