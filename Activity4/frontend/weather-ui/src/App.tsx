import { useState } from 'react';
import { getWeather, type Weather } from './api';

export default function App() {
  const [city, setCity] = useState('');
  const [result, setResult] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchWeather() {
    setError(null);
    if (!city.trim()) return;
    try {
      setLoading(true);
      const data = await getWeather(city.trim());
      setResult(data);
    } catch (e) {
      setError('Failed to fetch weather.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Weather</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Enter city" value={city} onChange={e => setCity(e.target.value)} />
        <button onClick={fetchWeather} disabled={loading}>Check</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 16, border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{String(result.city)}</div>
          <div style={{ color: '#333' }}>{String(result.temperatureC)} °C · {String(result.condition)}</div>
        </div>
      )}
    </div>
  );
}
