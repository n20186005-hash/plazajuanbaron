import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useTranslations } from 'next-intl';

const SNAPSHOT_PATH = join(process.cwd(), 'public', 'data', 'tides.json');

type TideEvent = { type: 'high' | 'low'; time: string; m: number };
type TideDay = { date: string; events: TideEvent[] };
type TidePayload = { station?: string; generated?: string; days: TideDay[] };

const LOCALES: Record<string, string> = { zh: 'zh-CN', en: 'en-GB', es: 'es-ES' };

let snapshotCache: TidePayload | null | undefined;

function loadSnapshot(): TidePayload | null {
  if (snapshotCache !== undefined) return snapshotCache;
  try {
    if (!existsSync(SNAPSHOT_PATH)) {
      snapshotCache = null;
      return null;
    }
    const json = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as TidePayload | null;
    snapshotCache = json && Array.isArray(json.days) && json.days.length > 0 ? json : null;
    return snapshotCache;
  } catch {
    snapshotCache = null;
    return null;
  }
}

function formatTime(raw: string, locale: string): string {
  const m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!m) return raw;
  if (locale === 'zh') {
    let hour = Number(m[1]);
    if (m[3] === 'PM' && hour < 12) hour += 12;
    if (m[3] === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${m[2]}`;
  }
  return `${Number(m[1])}:${m[2]} ${m[3]}`;
}

function dateParts(iso: string) {
  const [y, mo, d] = iso.split('-').map(Number);
  return { y, mo, d };
}

function weekdayLabel(iso: string, locale: string): string {
  const { y, mo, d } = dateParts(iso);
  try {
    return new Intl.DateTimeFormat(LOCALES[locale] || 'es-ES', {
      weekday: 'short',
    }).format(new Date(Date.UTC(y, (mo || 1) - 1, d || 1)));
  } catch {
    return iso.slice(5);
  }
}

function fullDate(iso: string, locale: string): string {
  const { y, mo, d } = dateParts(iso);
  try {
    return new Intl.DateTimeFormat(LOCALES[locale] || 'es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(Date.UTC(y, (mo || 1) - 1, d || 1)));
  } catch {
    return iso;
  }
}

function shortDate(iso: string): string {
  const parts = iso.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : iso.slice(5);
}

export default function TideTimes({ locale }: { locale: string }) {
  const tRaw = useTranslations('tideSection');
  const t = (k: string) => (tRaw as unknown as (k: string) => string)(k);

  const data = loadSnapshot();
  if (!data || data.days.length === 0) return null;

  const today = data.days[0];
  const upcoming = data.days.slice(1, 7);

  const meterText = (m: number) => `${Math.round(m * 100)} cm`;

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{
        background:
          'linear-gradient(165deg, #0d5a6e 0%, #0c4657 48%, #0a3245 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto relative">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2 text-white"
        >
          🌊 {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-3" style={{ background: '#7fd4e2' }} />
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {t('subtitle')}
        </p>

        {/* Today */}
        <div
          className="rounded-3xl p-6 sm:p-7 text-white"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
            <p className="font-display text-lg font-semibold">📅 {t('todayTag')}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {fullDate(today.date, locale)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {today.events.map((event) => {
              const isHigh = event.type === 'high';
              return (
                <div
                  key={`${event.type}-${event.time}`}
                  className="flex-1 basis-40 rounded-2xl px-4 py-3.5 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: `1px solid ${isHigh ? 'rgba(255,214,143,0.5)' : 'rgba(159,227,239,0.45)'}`,
                  }}
                >
                  <div className="text-xl mb-1">{isHigh ? '🌊' : '🪸'}</div>
                  <p className="text-2xl sm:text-3xl font-semibold leading-tight">
                    {formatTime(event.time, locale)}
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {isHigh ? t('high') : t('low')} · {meterText(event.m)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming days */}
        <p className="font-display text-lg font-semibold mt-8 mb-3 text-white">
          {t('upcomingTitle')}
        </p>
        <div
          className="rounded-2xl px-5 sm:px-6 text-white"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          {upcoming.map((day) => (
            <div
              key={day.date}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex items-baseline gap-2 min-w-[90px]">
                <span className="font-semibold">{weekdayLabel(day.date, locale)}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {shortDate(day.date)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {day.events.map((event) => {
                  const isHigh = event.type === 'high';
                  return (
                    <span
                      key={`${event.type}-${event.time}`}
                      className="text-sm rounded-full px-3 py-1"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: `1px solid ${isHigh ? 'rgba(255,214,143,0.4)' : 'rgba(159,227,239,0.4)'}`,
                        color: isHigh ? '#ffd98f' : '#bfeef6',
                      }}
                    >
                      {isHigh ? '↑ ' : '↓ '}
                      {t(isHigh ? 'high' : 'low')}
                      <span className="opacity-90"> · {formatTime(event.time, locale)} · {meterText(event.m)}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div
          className="rounded-3xl px-6 py-5 mt-8 text-white"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px dashed rgba(255,255,255,0.35)',
          }}
        >
          <p className="font-display font-semibold mb-3">🏖️ {t('tipsTitle')}</p>
          <ul className="space-y-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.92)' }}>
            <li>🪸 {t('tipLow')}</li>
            <li>🌊 {t('tipHigh')}</li>
          </ul>
          <p className="text-xs mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {t('tipNote')}
          </p>
        </div>
      </div>
    </section>
  );
}
