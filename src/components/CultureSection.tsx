import { useTranslations, useMessages } from 'next-intl';

const CARD_ICONS = ['🏛️', '🕰️', '🌅'];

export default function CultureSection() {
  const t = useTranslations('cultureSection');
  const messages = useMessages() as any;
  const cards = (messages?.cultureSection?.cards || []) as Array<{ title: string; text: string }>;
  const facts = (messages?.cultureSection?.facts || []) as string[];

  return (
    <section className="section-padding" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
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
          {t('lead')}
        </p>

        <div className="space-y-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row gap-5 transition-shadow hover:shadow-md"
              style={{
                background: 'var(--card-bg)',
                boxShadow: 'var(--card-shadow)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'var(--bg-tertiary)' }}
                aria-hidden="true"
              >
                {CARD_ICONS[i] || '•'}
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-10 rounded-xl p-6 sm:p-8"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            💡 {t('factsTitle')}
          </h3>
          <ul className="space-y-3 mb-5">
            {facts.map((fact, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {fact}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {t('sourceNote')}
          </p>
        </div>
      </div>
    </section>
  );
}
