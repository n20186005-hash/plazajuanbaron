import { useTranslations } from 'next-intl';
import {
  EMOJI,
  type WeatherPayload,
  conditionKey,
  isValidWeatherPayload,
} from '@/lib/weather';

const FORECAST_DAYS = 7;

type GroupKey = 'outfit' | 'plan' | 'gear' | 'risk';

const LOCALES: Record<string, string> = { zh: 'zh-CN', en: 'en-GB', es: 'es-ES' };

const GROUP_ICON: Record<GroupKey, string> = {
  outfit: '🧥',
  plan: '🗺️',
  gear: '🎒',
  risk: '⚠️',
};

function rainKind(code: number): 'none' | 'light' | 'heavy' | 'thunder' {
  if (code >= 95) return 'thunder';
  if ((code >= 63 && code <= 67) || (code >= 80 && code <= 82)) return 'heavy';
  if ((code >= 51 && code <= 57) || code === 61 || code === 62) return 'light';
  return 'none';
}

function skyKind(code: number): 'clear' | 'cloudy' | 'fog' | null {
  if (code <= 1) return 'clear';
  if (code === 2 || code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  return null;
}

function beaufort(kmh: number): number {
  if (kmh < 1) return 0;
  if (kmh < 6) return 1;
  if (kmh < 12) return 2;
  if (kmh < 20) return 3;
  if (kmh < 29) return 4;
  if (kmh < 39) return 5;
  if (kmh < 50) return 6;
  if (kmh < 62) return 7;
  return 8;
}

function windWordKey(speed: number): string {
  if (speed < 20) return 'light';
  if (speed < 40) return 'moderate';
  return 'strong';
}

function humidityWordKey(value: number): string {
  if (value < 45) return 'low';
  if (value <= 70) return 'mid';
  return 'high';
}

function buildRecommendations(d: WeatherPayload): Record<GroupKey, string[]> {
  const rec: Record<GroupKey, string[]> = { outfit: [], plan: [], gear: [], risk: [] };
  const add = (group: GroupKey, id: string) => {
    if (!rec[group].includes(id)) rec[group].push(id);
  };

  const code = d.daily.weather_code[0] ?? d.current.weather_code;
  const maxT = d.daily.temperature_2m_max[0];
  const minT = d.daily.temperature_2m_min[0];
  const prob = d.daily.precipitation_probability_max?.[0] ?? 0;
  const uv = d.daily.uv_index_max?.[0] ?? 0;
  const windMax = Math.max(
    d.current.wind_speed_10m,
    d.daily.wind_speed_10m_max?.[0] ?? 0
  );
  const bf = beaufort(windMax);
  const rain = rainKind(code);
  const sky = skyKind(code);

  if (prob >= 60 && rain === 'none') {
    add('plan', 'rainLikely');
    add('gear', 'gearLikely');
  }
  if (rain === 'light') {
    add('plan', 'rainLight');
    add('gear', 'gearLight');
  }
  if (rain === 'heavy') {
    add('risk', 'rainHeavyRisk');
    add('plan', 'rainHeavyPlan');
    add('gear', 'gearHeavy');
  }
  if (rain === 'thunder') {
    add('risk', 'thunderRisk');
    add('plan', 'thunderPlan');
    add('gear', 'gearThunder');
  }

  if (maxT >= 32) {
    add('outfit', 'heatOutfit');
    add('plan', 'heatPlan');
    add('gear', 'gearHeat');
  }
  if (uv >= 5) {
    add('gear', 'gearUv');
    if (uv >= 11) add('plan', 'uvExtremePlan');
  }
  if (maxT - minT > 8) add('outfit', 'diffOutfit');
  if (maxT <= 10) add('outfit', 'coldOutfit');

  if (bf >= 7) {
    add('risk', 'windHighRisk');
    add('plan', 'windHighPlan');
    add('gear', 'gearWindHigh');
  } else if (bf >= 5) {
    add('plan', 'windMidPlan');
    add('gear', 'gearWindMid');
  }

  if (sky === 'clear') add('plan', 'clearPlan');
  if (sky === 'cloudy') add('plan', 'cloudyPlan');
  if (sky === 'fog') {
    add('risk', 'fogRisk');
    add('gear', 'gearFog');
  }

  return rec;
}

export default function WeatherForecast({
  data,
  locale,
}: {
  data: WeatherPayload | null;
  locale: string;
}) {
  const tRaw = useTranslations('weatherSection');
  const t = (k: string) => (tRaw as unknown as (k: string) => string)(k);

  const intlLocale = LOCALES[locale] || 'es-ES';
  const formatDeg = (value: number) => `${Math.round(value)}°`;

  const dayLabel = (iso: string, index: number): string => {
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

  const shortDate = (iso: string) => {
    const parts = iso.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : '';
  };

  const valid = isValidWeatherPayload(data);

  if (!valid) {
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
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <div className="text-4xl mb-3">🌦️</div>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t('fallback')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const d = data as WeatherPayload;
  const current = d.current;
  const advice = buildRecommendations(d);
  const day0 = d.daily.time[0];
  const dayLast = d.daily.time[d.daily.time.length - 1];
  const alerts = (d.alerts?.alert || []).filter((a) => {
    if (!a.start || !day0 || !dayLast) return true;
    const start = a.start.slice(0, 10);
    return start >= day0 && start <= dayLast;
  });

  const wind = Math.round(current.wind_speed_10m);
  const precipProb = Math.round(d.daily.precipitation_probability_max?.[0] ?? 0);
  const humidityValue = current.relative_humidity_2m;
  const dayPrecip = (index: number) =>
    Math.round(d.daily.precipitation_probability_max?.[index] ?? 0);

  const groupOrder: GroupKey[] = ['outfit', 'plan', 'gear'];
  const statCells = [
    { label: t('feelsLike'), value: formatDeg(current.apparent_temperature) },
    {
      label: t('humidity'),
      value: t(`humidityWord.${humidityWordKey(humidityValue)}`),
    },
    { label: t('precip'), value: precipProb >= 0 ? `${precipProb}%` : '—' },
    {
      label: t('wind'),
      value: `${wind} km/h · ${t(`windWord.${windWordKey(wind)}`)}`,
    },
  ];

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-3" style={{ background: 'var(--accent)' }} />
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          {t('subtitle')}
        </p>

        {/* Current conditions */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-white"
          style={{ background: 'linear-gradient(135deg, #2f6b7c 0%, #123844 100%)' }}
        >
          <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl leading-none">
                {EMOJI[conditionKey(current.weather_code)]}
              </span>
              <div>
                <p className="text-sm mb-1" style={{ opacity: 0.9 }}>
                  {t('now')}
                </p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-semibold leading-none">
                    {formatDeg(current.temperature_2m)}
                  </span>
                  <span className="text-lg leading-none" style={{ opacity: 0.95 }}>
                    {t(`conditions.${conditionKey(current.weather_code)}`)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[260px]">
              {statCells.map((cell) => (
                <div
                  key={cell.label}
                  className="rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
                >
                  <p className="text-xs mb-1" style={{ opacity: 0.85 }}>
                    {cell.label}
                  </p>
                  <p className="text-sm font-semibold leading-snug">{cell.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart advice */}
        {(advice.outfit.length > 0 ||
          advice.plan.length > 0 ||
          advice.gear.length > 0 ||
          advice.risk.length > 0 ||
          alerts.length > 0) && (
          <div
            className="mt-6 rounded-3xl p-6 sm:p-8"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
          >
            <p
              className="font-display text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              💡 {t('adviceTitle')}
            </p>

            {alerts.length > 0 && (
              <div
                role="alert"
                className="rounded-2xl px-5 py-4 mb-5 text-white"
                style={{ background: '#b3261e' }}
              >
                <p className="font-semibold mb-1">🚨 {t('alertTitle')}</p>
                {alerts.map((alert) => (
                  <p key={`${alert.event}-${alert.start}`} className="text-sm leading-relaxed">
                    {t('alertTemplate').replace(
                      '{name}',
                      alert.event || alert.description || t('alertTitle')
                    )}
                  </p>
                ))}
              </div>
            )}

            {advice.risk.length > 0 && (
              <div
                className="rounded-2xl px-5 py-4 mb-5"
                style={{
                  background: 'rgba(190, 38, 30, 0.08)',
                  border: '1px solid rgba(190, 38, 30, 0.35)',
                }}
              >
                <p
                  className="font-semibold mb-2 flex items-center gap-2"
                  style={{ color: '#b3261e' }}
                >
                  <span>{GROUP_ICON.risk}</span>
                  {t('groups.risk')}
                </p>
                <ul className="space-y-1.5">
                  {advice.risk.map((id) => (
                    <li
                      key={id}
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t(`advice.risk.${id}`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-x-8 gap-y-6">
              {groupOrder
                .filter((g) => advice[g].length > 0)
                .map((g) => (
                  <div key={g} className="flex-1 basis-64">
                    <p
                      className="font-medium mb-2.5 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span>{GROUP_ICON[g]}</span>
                      {t(`groups.${g}`)}
                    </p>
                    <ul className="space-y-2">
                      {advice[g].map((id) => (
                        <li
                          key={id}
                          className="rounded-xl px-3.5 py-2.5 text-sm leading-snug"
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {t(`advice.${g}.${id}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 7-day forecast */}
        <p
          className="font-display text-xl font-semibold mt-10 mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('forecastTitle')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {d.daily.time.slice(0, FORECAST_DAYS).map((day, i) => {
            const cKey = conditionKey(d.daily.weather_code[i]);
            const prob = dayPrecip(i);
            return (
              <div
                key={day}
                className="rounded-xl p-3.5 flex flex-col items-center text-center gap-1"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  {dayLabel(day, i)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {shortDate(day)}
                </span>
                <span className="text-2xl leading-none mt-1">{EMOJI[cKey]}</span>
                <span
                  className="text-[11px] leading-tight min-h-[2.4em] flex items-center justify-center"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t(`conditions.${cKey}`)}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="opacity-70">{formatDeg(d.daily.temperature_2m_min[i])}</span>
                  <span className="mx-1" style={{ color: 'var(--text-muted)' }}>
                    /
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatDeg(d.daily.temperature_2m_max[i])}
                  </span>
                </span>
                {prob >= 40 && (
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(74,144,226,0.12)', color: '#4a90e2' }}
                  >
                    💧 {prob}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
