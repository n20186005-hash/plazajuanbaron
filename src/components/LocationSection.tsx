import { useTranslations } from 'next-intl';
import { useMessages } from 'next-intl';
import { SITE } from '@/config/site';

type MessageShape = {
  locationSection: {
    addressLabel: string;
    entranceLabel: string;
    plusCodeLabel: string;
    directionLabel: string;
  };
};

export default function LocationSection() {
  const t = useTranslations('locationSection');
  const tB = useTranslations('basicInfo');
  const messages = useMessages() as any as MessageShape;

  const blocks = [
    {
      label: messages.locationSection.addressLabel,
      value: tB('addressValue'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      label: messages.locationSection.entranceLabel,
      value: t('entrance'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: messages.locationSection.plusCodeLabel,
      value: `${SITE.plusCode} Santo Domingo ${SITE.postalCode}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      ),
    },
    {
      label: messages.locationSection.directionLabel,
      value: t('directions'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      ),
    },
  ];

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {tB('addressValue')}
        </p>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        <p
          className="text-lg leading-relaxed mb-10"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('intro')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {blocks.map((block, i) => (
            <div
              key={i}
              className="rounded-xl p-5 flex items-start gap-4"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ background: 'var(--accent)' }}
              >
                {block.icon}
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{block.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {block.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={SITE.mapsShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t('getDirections')}
          </a>
        </div>
      </div>
    </section>
  );
}
