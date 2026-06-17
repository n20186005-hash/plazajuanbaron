'use client';

import { useTranslations, useMessages } from 'next-intl';

export default function RouteSection() {
  const t = useTranslations('route');
  const messages = useMessages() as any;
  const supplementsData = (messages?.route?.supplements || []) as string[];

  const supplements = Array.from({ length: supplementsData.length }, (_, i) => i);

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-8" style={{ background: 'var(--accent)' }} />

        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
        >
          <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {t('overview')}
          </p>
        </div>

        {/* Supplements */}
        <div
          className="rounded-xl p-6 mt-8"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--accent)' }}
        >
          <h3 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('supplementsTitle')}
          </h3>
          <ul className="space-y-3">
            {supplements.map((i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{t(`supplements.${i}` as any)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
