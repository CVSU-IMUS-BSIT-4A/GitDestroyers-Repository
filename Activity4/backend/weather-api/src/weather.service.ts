import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  async getWeather(city: string) {
    if (!city?.trim()) throw new HttpException('city is required', 400);
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new HttpException('OPENWEATHER_API_KEY not set', 500);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const { data } = await axios.get(url);
    return {
      city: data.name,
      temperatureC: data.main?.temp,
      condition: data.weather?.[0]?.main,
    };
  }
}

