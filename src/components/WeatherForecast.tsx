import https from 'node:https';
import { useTranslations } from 'next-intl';
import { SITE } from '@/config/site';

const API_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const TIMEZONE = 'America/Santo_Domingo';
const FORECAST_DAYS = 5;

type CurrentWeather = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
};

type Daily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
};

type Payload = {
  current: CurrentWeather;
  daily: Daily;
};

const LOCALES: Record<string, string> = { zh: 'zh-CN', en: 'en-GB', es: 'es-ES' };

const EMOJI: Record<string, string> = {
  sunny: '☀️',
  partlyCloudy: '⛅',
  overcast: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  snow: '❄️',
  thunderstorm: '⛈️',
};

function conditionKey(code: number): string {
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

let cached: Payload | null | undefined;

function httpGetJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body) as T);
        } catch (err) {
          reject(err as Error);
        }
      });
    });
    req.setTimeout(12000, () => req.destroy(new Error('Weather request timed out')));
    req.on('error', reject);
  });
}

async function fetchWeatherData(): Promise<Payload | null> {
  if (cached !== undefined) return cached;
  try {
    const params = new URLSearchParams({
      latitude: String(SITE.latitude),
      longitude: String(SITE.longitude),
      current:
        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: TIMEZONE,
      forecast_days: String(FORECAST_DAYS),
    });
    const json = await httpGetJson<Payload | null>(`${API_ENDPOINT}?${params.toString()}`);
    if (!json || !json.current || !json.daily || !Array.isArray(json.daily.time)) {
      cached = null;
      return null;
    }
    cached = json;
    return json;
  } catch {
    cached = null;
    return null;
  }
}

export default async function WeatherForecast({ locale }: { locale: string }) {
  const tRaw = useTranslations('weatherSection');
  const t = (key: string) => (tRaw as unknown as (k: string) => string)(key);

  const data = await fetchWeatherData();
  const intlLocale = LOCALES[locale] || 'es-ES';

  const formatDeg = (value: number) => `${Math.round(value)}°`;
  const weekdayOf = (iso: string, index: number): string => {
    if (index === 0) return t('today');
    const [year, month, day] = iso.split('-').map(Number);
    try {
      return new Intl.DateTimeFormat(intlLocale, { weekday: 'short' }).format(
        new Date(Date.UTC(year, (month || 1) - 1, day || 1))
      );
    } catch {
      return iso.slice(5);
    }
  };

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-8" style={{ background: 'var(--accent)' }} />

        {!data ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="text-4xl mb-3">🌦️</div>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t('fallback')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
            {/* Current conditions */}
            <div
              className="rounded-2xl p-6 text-white flex flex-col"
              style={{ background: 'linear-gradient(135deg, #3a7a8d 0%, #17424f 100%)' }}
            >
              <p className="text-sm font-medium mb-3" style={{ opacity: 0.9 }}>
                {t('now')}
              </p>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-5xl leading-none">{EMOJI[conditionKey(data.current.weather_code)]}</span>
                <div>
                  <div className="text-5xl font-semibold leading-none">
                    {formatDeg(data.current.temperature_2m)}
                  </div>
                  <p className="mt-2 text-sm" style={{ opacity: 0.95 }}>
                    {t(`conditions.${conditionKey(data.current.weather_code)}`)}
                  </p>
                </div>
              </div>
              <div className="mt-auto space-y-2 text-sm">
                <div className="flex justify-between gap-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.18)' }}>
                  <span style={{ opacity: 0.85 }}>{t('feelsLike')}</span>
                  <span className="font-medium">{formatDeg(data.current.apparent_temperature)}</span>
                </div>
                <div className="flex justify-between gap-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.18)' }}>
                  <span style={{ opacity: 0.85 }}>{t('humidity')}</span>
                  <span className="font-medium">{Math.round(data.current.relative_humidity_2m)}%</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span style={{ opacity: 0.85 }}>{t('wind')}</span>
                  <span className="font-medium">{Math.round(data.current.wind_speed_10m)} km/h</span>
                </div>
              </div>
            </div>

            {/* Daily forecast */}
            <div className="flex flex-col">
              <p className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t('forecastTitle')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {data.daily.time.map((day, i) => {
                  const key = conditionKey(data.daily.weather_code[i]);
                  return (
                    <div
                      key={day}
                      className="rounded-xl p-4 flex flex-col items-center text-center gap-1.5"
                      style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {weekdayOf(day, i)}
                      </span>
                      <span className="text-2xl leading-none">{EMOJI[key]}</span>
                      <span className="text-xs leading-snug min-h-[2.4em] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                        {t(`conditions.${key}`)}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="opacity-70">{formatDeg(data.daily.temperature_2m_min[i])}</span>
                        <span className="mx-1" style={{ color: 'var(--text-muted)' }}>/</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {formatDeg(data.daily.temperature_2m_max[i])}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
