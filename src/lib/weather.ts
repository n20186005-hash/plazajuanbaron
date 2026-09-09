/**
 * Weather data layer (server-side).
 *
 * `getWeatherData()` is designed to run in a Server Component: it fetches the
 * current conditions + 7-day forecast at render/build time with a short-lived
 * cache (revalidate) and, if the request ever fails, transparently falls back
 * to the committed build-time snapshot so the section never shows as
 * "unavailable" just because an upstream request hiccupped.
 *
 * No provider or licensing strings live in this module's UI output.
 */
import snapshot from '../../public/data/weather.json';

export type CurrentWeather = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
};

export type Daily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max?: number[];
  uv_index_max?: number[];
  wind_speed_10m_max?: number[];
  sunrise?: string[];
  sunset?: string[];
};

export type WeatherAlert = {
  event?: string;
  description?: string;
  start?: string;
  end?: string;
};

export type WeatherPayload = {
  current: CurrentWeather;
  daily: Daily;
  alerts?: { alert?: WeatherAlert[] };
  timezone?: string;
  fetchedAt?: string;
};

export const WEATHER_TIMEZONE = 'America/Santo_Domingo';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

function buildWeatherUrl(): string {
  const u = new URL(WEATHER_API_URL);
  u.searchParams.set('latitude', '18.4646216');
  u.searchParams.set('longitude', '-69.8926837');
  u.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m'
  );
  u.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max,sunrise,sunset'
  );
  u.searchParams.set('timezone', WEATHER_TIMEZONE);
  u.searchParams.set('forecast_days', '7');
  return u.toString();
}

export const EMOJI: Record<string, string> = {
  sunny: '☀️',
  partlyCloudy: '⛅',
  overcast: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  snow: '❄️',
  thunderstorm: '⛈️',
};

export function conditionKey(code: number): string {
  if (code === 0) return 'sunny';
  if (code === 1 || code === 2) return 'partlyCloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'thunderstorm';
  return 'partlyCloudy';
}

export function conditionEmoji(code: number): string {
  return EMOJI[conditionKey(code)] || '⛅';
}

export function isValidWeatherPayload(value: unknown): value is WeatherPayload {
  if (!value || typeof value !== 'object') return false;
  const p = value as WeatherPayload;
  return Boolean(
    p.current &&
      typeof p.current.temperature_2m === 'number' &&
      Number.isFinite(p.current.temperature_2m) &&
      p.daily &&
      Array.isArray(p.daily.time) &&
      p.daily.time.length > 0 &&
      Array.isArray(p.daily.weather_code) &&
      Array.isArray(p.daily.temperature_2m_max)
  );
}

let fallbackCache: WeatherPayload | null | undefined;

function snapshotFallback(): WeatherPayload | null {
  if (fallbackCache !== undefined) return fallbackCache;
  fallbackCache = isValidWeatherPayload(snapshot) ? snapshot : null;
  return fallbackCache;
}

export async function getWeatherData(): Promise<WeatherPayload | null> {
  try {
    const res = await fetch(buildWeatherUrl(), {
      headers: { accept: 'application/json' },
      next: { revalidate: 1800 },
    });
    if (res.ok) {
      const json: unknown = await res.json();
      if (isValidWeatherPayload(json)) return json;
    }
  } catch {
    // fall through to the committed snapshot
  }
  return snapshotFallback();
}

/**
 * Formats an ISO timestamp (returned by the forecast API in the site timezone)
 * as a short local clock time, e.g. "18:42".
 */
export function formatLocalClock(iso: string, locale: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso.slice(11, 16);
    const loc = locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-GB' : 'es-ES';
    return new Intl.DateTimeFormat(loc, {
      timeZone: WEATHER_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return iso.slice(11, 16);
  }
}

/** Today's sunset local clock time, if the snapshot/forecast covers today. */
export function todaySunset(data: WeatherPayload): string | null {
  const iso = data.daily.sunset?.[0];
  return iso ? formatLocalClock(iso, 'en') : null;
}
