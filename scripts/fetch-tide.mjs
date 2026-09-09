// Build-time tide snapshot for Santo Domingo (Ciudad Trujillo) / Dominican Republic.
// Data source: tide-forecast.com prediction tables (public static HTML).
// Only writes a snapshot when parsing succeeds, so transient failures keep the last good file.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'data',
  'tides.json'
);
const URL =
  'https://www.tide-forecast.com/locations/Santo-Domingo-Ciudad-Trujillo-Dominican-Republic/tides/latest';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)';

const DAY_SPLIT = '<div class="tide-day">';
const ROW_RE =
  /<tr[^>]*>\s*<td>(?:<[^>]*>)?(High|Low) Tide<\/td>[\s\S]*?<td><b>\s*(\d{1,2}:\d{2})\s*([AP]M)<\/b>[\s\S]*?<b class="js-two-units-length-value__primary">([\d.]+) m<\/b>/g;
const DATE_RE = /[A-Za-z]+\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/;

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function parseRows(html) {
  const events = [];
  const re = new RegExp(ROW_RE.source, 'g');
  let match;
  while ((match = re.exec(html)) !== null) {
    const type = match[1].toLowerCase();
    const time = `${match[2]} ${match[3]}`;
    const m = Number(match[4]);
    if (!Number.isFinite(m)) continue;
    const dup = events.some((e) => e.type === type && e.time === time && e.m === m);
    if (!dup) events.push({ type, time, m });
  }
  return events.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

function timeToMinutes(raw) {
  const m = raw.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3] === 'PM') h += 12;
  return h * 60 + Number(m[2]);
}

function parseIso(text) {
  const m = text.match(DATE_RE);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  const day = Number(m[1]);
  const year = Number(m[3]);
  if (!day || !year) return null;
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

try {
  const res = await fetch(URL, {
    headers: { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const days = new Map();

  // Today's table (rendered at the top of the page).
  const todayMarker = html.indexOf("Today's tide times");
  if (todayMarker !== -1) {
    const endMarker = html.indexOf('tide-header-livetide', todayMarker);
    const slice = html.slice(
      todayMarker,
      endMarker === -1 ? todayMarker + 8000 : endMarker
    );
    const iso = parseIso(slice);
    const events = parseRows(slice);
    if (iso && events.length > 0) days.set(iso, events);
  }

  // Upcoming days (each card is one <div class="tide-day">).
  const blocks = html.split(DAY_SPLIT);
  for (const block of blocks) {
    const iso = parseIso(block);
    if (!iso) continue;
    const events = parseRows(block);
    if (events.length === 0) continue;
    if (!days.has(iso)) {
      days.set(iso, events);
    } else {
      const existing = days.get(iso);
      const merged = [...existing];
      for (const e of events) {
        if (!existing.some((x) => x.type === e.type && x.time === e.time)) merged.push(e);
      }
      days.set(iso, merged.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)));
    }
  }

  const sorted = [...days.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(0, 7)
    .map(([date, events]) => ({ date, events }));

  if (sorted.length < 1) {
    console.warn('[tide] no tide days parsed, keeping previous snapshot');
    process.exit(0);
  }

  const payload = {
    station: 'Santo Domingo (Ciudad Trujillo), Dominican Republic',
    timezone: 'AST (UTC-4)',
    generated: new Date().toISOString(),
    days: sorted,
  };
  writeFileSync(OUT_FILE, JSON.stringify(payload));
  console.log(`[tide] OK -> ${OUT_FILE} (${sorted.length} days)`);
} catch (error) {
  console.warn('[tide] failed, keeping previous snapshot:', error.message);
  process.exit(0);
}
