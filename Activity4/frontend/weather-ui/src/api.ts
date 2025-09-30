import axios from 'axios';

export const api = axios.create({ baseURL: 'http://localhost:3004' });

export type Weather = { city: string; temperatureC: number; condition: string };

export async function getWeather(city: string) {
  const { data } = await api.get<Weather>('/weather', { params: { city } });
  return data;
}
