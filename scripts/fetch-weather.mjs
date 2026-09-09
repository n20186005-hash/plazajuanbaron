/**
 * Build-time weather snapshot.
 * Fetches current conditions + 7-day forecast for Plaza Juan Barón from
 * Open-Meteo (free, no API key) and stores it at public/data/weather.json.
 * Runs automatically before every `npm run build` (see package.json "prebuild").
 *
 * The snapshot is committed to the repository as a fallback. A snapshot is only
 * written when the fetch + parse succeeds, so transient failures (timeout,
 * HTTP 429, DNS…) keep the last known-good file and the site never shows the
 * "weather unavailable" state just because the API was unreachable.
 */
import https from 'node:https';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
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
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max,sunrise,sunset',
  timezone: 'America/Santo_Domingo',
  forecast_days: '7',
});

const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

function keepPreviousSnapshot(reason, err) {
  if (existsSync(outFile)) {
    console.warn(`[weather] ${reason} (${err || 'unknown error'}), keeping previous snapshot`);
  } else {
    console.warn(`[weather] ${reason} (${err || 'unknown error'}), no snapshot available yet`);
  }
}

function isValidPayload(json) {
  return (
    json &&
    typeof json === 'object' &&
    json.current &&
    typeof json.current.temperature_2m === 'number' &&
    Number.isFinite(json.current.temperature_2m) &&
    json.daily &&
    Array.isArray(json.daily.time) &&
    json.daily.time.length > 0 &&
    Array.isArray(json.daily.weather_code)
  );
}

const req = https.get(url, (res) => {
  if (res.statusCode !== 200) {
    res.resume();
    keepPreviousSnapshot(`Open-Meteo returned HTTP ${res.statusCode}`);
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
      if (!isValidPayload(json)) {
        throw new Error('unexpected payload structure');
      }
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outFile, JSON.stringify({ ...json, fetchedAt: new Date().toISOString() }));
      console.log(`[weather] OK -> ${outFile}`);
    } catch (err) {
      keepPreviousSnapshot('failed to parse weather payload', err);
    }
  });
});
req.setTimeout(15000, () => req.destroy(new Error('request timed out')));
req.on('error', (err) => keepPreviousSnapshot('weather request failed', err.message || err));
