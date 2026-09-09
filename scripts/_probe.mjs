const url =
  'https://www.tide-forecast.com/locations/Santo-Domingo-Ciudad-Trujillo-Dominican-Republic/tides/latest';
const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
const t = await res.text();
const rowRe = />\s*(High|Low) Tide<\/td>[\s\S]*?<td><b>\s*(\d{1,2}:\d{2})\s*([AP]M)<\/b>[\s\S]*?<b class="js-two-units-length-value__primary">([\d.]+) m<\/b>/g;
let m;
const all = [];
while ((m = rowRe.exec(t)) !== null) all.push({ type: m[1], time: m[2] + ' ' + m[3], cm: Math.round(+m[4] * 100) });
console.log('total event rows parsed:', all.length);
console.log(all.slice(0, 20));
// count before index 120000
console.log('before120k rows:', all.filter((r) => rowRe.lastIndex < 120000).length);
const idx = t.indexOf("Today's tide times for Santo Domingo");
console.log('today idx', idx, '| next tide-day after', t.indexOf('tide-day', idx));
console.log(t.slice(40130, 42200));
