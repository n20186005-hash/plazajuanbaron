import { useTranslations, useMessages } from 'next-intl';

const ICONS = ['🚻', '🅿️', '🍽️', '🏨', '🛒', '⛽'];

export default function AmenitiesSection() {
  const t = useTranslations('amenitiesSection');
  const messages = useMessages() as any;
  const items = (messages?.amenitiesSection?.items || []) as Array<{
    label: string;
    text: string;
  }>;

  return (
    <section className="section-padding">
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-8" style={{ background: 'var(--accent)' }} />

        <p
          className="text-lg leading-relaxed mb-10"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('intro')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-6 transition-shadow hover:shadow-md"
              style={{
                background: 'var(--card-bg)',
                boxShadow: 'var(--card-shadow)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'var(--bg-tertiary)' }}
                  aria-hidden="true"
                >
                  {ICONS[i] || '•'}
                </span>
                <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {item.label}
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-8 rounded-xl p-5 sm:p-6 text-sm leading-relaxed"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
          }}
        >
          {t('disclaimer')}
        </div>
      </div>
    </section>
  );
}
