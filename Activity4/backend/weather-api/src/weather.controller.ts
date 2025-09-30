import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weather: WeatherService) {}

  @Get()
  @ApiQuery({ name: 'city', required: true })
  async get(@Query('city') city: string) {
    return this.weather.getWeather(city);
  }
}

