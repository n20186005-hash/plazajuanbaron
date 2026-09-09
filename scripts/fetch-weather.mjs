/**
 * Build-time weather snapshot.
 * Fetches current conditions + 5-day forecast for Plaza Juan Barón from
 * Open-Meteo (free, no API key) and stores it at public/data/weather.json.
 * Runs automatically before every `npm run build` (see package.json "prebuild").
 */
import https from 'node:https';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'data');
const outFile = join(outDir, 'weather.json');

const params = new URLSearchParams({
  latitude: '18.4646216',
  longitude: '-69.8926837',
  current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
  daily:
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max',
  timezone: 'America/Santo_Domingo',
  forecast_days: '7',
});

const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

function finish(ok, msg) {
  console.log(ok ? `[weather] OK -> ${outFile}` : `[weather] SKIPPED: ${msg}`);
}

const req = https.get(url, (res) => {
  if (res.statusCode !== 200) {
    res.resume();
    finish(false, `HTTP ${res.statusCode}`);
    return;
  }
  let body = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      if (!json?.current || !json?.daily) {
        finish(false, 'unexpected payload');
        return;
      }
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outFile, JSON.stringify(json));
      finish(true, null);
    } catch (err) {
      finish(false, String(err));
    }
  });
});
req.setTimeout(15000, () => req.destroy(new Error('request timed out')));
req.on('error', (err) => finish(false, String(err.message || err)));
