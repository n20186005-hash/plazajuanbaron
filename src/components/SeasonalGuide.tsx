export type SeasonalRow = {
  season: string;
  weather: string;
  sea: string;
  nature: string;
  tip: string;
};

export type SeasonalGuideData = {
  title: string;
  subtitle: string;
  note: string;
  colSeason: string;
  colWeather: string;
  colSea: string;
  colNature: string;
  colTip: string;
  rows: SeasonalRow[];
};

type ColumnTitle = 'colSeason' | 'colWeather' | 'colSea' | 'colNature' | 'colTip';

const COLS: Array<{ key: keyof SeasonalRow; title: ColumnTitle; w: string }> = [
  { key: 'season', title: 'colSeason', w: 'w-[150px]' },
  { key: 'weather', title: 'colWeather', w: 'w-[22%]' },
  { key: 'sea', title: 'colSea', w: 'w-[18%]' },
  { key: 'nature', title: 'colNature', w: 'w-[20%]' },
  { key: 'tip', title: 'colTip', w: '' },
];

export default function SeasonalGuide({ messages }: { messages: SeasonalGuideData }) {
  if (!messages || !Array.isArray(messages.rows) || messages.rows.length === 0) return null;
  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {messages.title}
        </h2>
        <div className="w-12 h-0.5 mb-3" style={{ background: 'var(--accent)' }} />
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {messages.subtitle}
        </p>

        <div
          className="overflow-x-auto rounded-2xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <table className="w-full min-w-[860px] text-left text-sm border-collapse">
            <thead>
              <tr>
                {COLS.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3 font-semibold whitespace-nowrap"
                    style={{
                      color: 'var(--accent)',
                      background: 'rgba(47,107,124,0.08)',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    {messages[col.title]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {messages.rows.map((row) => (
                <tr key={row.season}>
                  <td
                    className="px-5 py-4 align-top font-semibold whitespace-nowrap"
                    style={{
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    {row.season}
                  </td>
                  <td
                    className="px-5 py-4 align-top leading-relaxed"
                    style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    {row.weather}
                  </td>
                  <td
                    className="px-5 py-4 align-top leading-relaxed"
                    style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    {row.sea}
                  </td>
                  <td
                    className="px-5 py-4 align-top leading-relaxed"
                    style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    {row.nature}
                  </td>
                  <td
                    className="px-5 py-4 align-top leading-relaxed"
                    style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    {row.tip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p
          className="text-xs leading-relaxed mt-5"
          style={{ color: 'var(--text-muted)' }}
        >
          {messages.note}
        </p>
      </div>
    </section>
  );
}
