import { useTranslations, useMessages } from 'next-intl';
import { SITE } from '@/config/site';

export default function NearbySection() {
  const t = useTranslations('nearbySection');
  const messages = useMessages() as any;
  const items = (messages?.nearbySection?.items || []) as Array<{
    name: string;
    type: string;
    description: string;
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {item.name}
                </h3>
              </div>
              <p
                className="text-xs mb-3 inline-block px-2.5 py-1 rounded-full"
                style={{ background: 'var(--tag-bg)', color: 'var(--tag-text)' }}
              >
                {item.type}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={SITE.mapsShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            {t('explore')}
          </a>
        </div>
      </div>
    </section>
  );
}
