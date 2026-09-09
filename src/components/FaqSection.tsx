import { useTranslations, useMessages } from 'next-intl';

export default function FaqSection() {
  const t = useTranslations('faqSection');
  const messages = useMessages() as any;
  const items = (messages?.faqSection?.items || []) as Array<{ q: string; a: string }>;

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        <div className="space-y-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-5 sm:p-6"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            >
              <h3 className="font-display text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {item.q}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
