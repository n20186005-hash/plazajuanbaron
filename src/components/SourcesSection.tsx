import { useTranslations, useMessages } from 'next-intl';

export default function SourcesSection() {
  const t = useTranslations('sourcesSection');
  const messages = useMessages() as any;
  const items = (messages?.sourcesSection?.items || []) as Array<{
    name: string;
    url: string;
    note: string;
  }>;

  return (
    <section className="section-padding">
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-8" style={{ background: 'var(--accent)' }} />

        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('intro')}
        </p>

        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl p-4"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            >
              <span
                className="mt-2 flex-shrink-0 w-2 h-2 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
              <div className="min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline break-all"
                  style={{ color: 'var(--accent)' }}
                >
                  {item.name}
                </a>
                {item.note && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
