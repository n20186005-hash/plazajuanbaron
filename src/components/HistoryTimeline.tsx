'use client';

import { useTranslations } from 'next-intl';

export default function HistoryTimeline() {
  const t = useTranslations('historyTimeline');
  
  // Create an array for the items to iterate easily
  const items = [0, 1, 2];

  return (
    <section className="section-padding" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-12 mx-auto" style={{ background: 'var(--accent)' }} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {items.map((index) => (
            <div key={index} className="bg-opacity-50 rounded-xl p-6 shadow-sm transition-transform hover:-translate-y-1" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="text-3xl mb-4">
                {index === 0 ? '🌅' : index === 1 ? '🍔' : '🎡'}
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t(`items.${index}.title`)}
              </h3>
              <div className="text-sm font-medium mb-3 py-1 px-3 inline-block rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                ✨ {t(`items.${index}.plaque`)}
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t(`items.${index}.description`)}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-6 md:p-8" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <h4 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            💡 {t('guideTitle')}
          </h4>
          <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{
            __html: t('guideContent')
              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary)">$1</strong>')
          }} />
        </div>
      </div>
    </section>
  );
}
