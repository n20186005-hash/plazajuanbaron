import { setRequestLocale } from 'next-intl/server';
import { SITE, OG_IMAGE_URL } from '@/config/site';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import BasicInfo from '@/components/BasicInfo';
import HistoryTimeline from '@/components/HistoryTimeline';
import LocationSection from '@/components/LocationSection';
import NearbySection from '@/components/NearbySection';
import RouteSection from '@/components/RouteSection';
import HoursSection from '@/components/HoursSection';
import TicketsSection from '@/components/TicketsSection';
import TransportSection from '@/components/TransportSection';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import MapEmbed from '@/components/MapEmbed';
import { Suspense } from 'react';
import FaqSection from '@/components/FaqSection';
import SourcesSection from '@/components/SourcesSection';
import WeatherForecast from '@/components/WeatherForecast';
import TideTimes from '@/components/TideTimes';
import AmenitiesSection from '@/components/AmenitiesSection';
import CultureSection from '@/components/CultureSection';
import Footer from '@/components/Footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = (await import(`@/messages/${locale}.json`)).default as any;
  const selfUrl = `${SITE.baseUrl}/${locale}`;

  // 1. TouristAttraction + Park structured data (with @id + image + NAP + Google rating)
  const attractionLd = {
    '@context': 'https://schema.org',
    '@type': ['TouristAttraction', 'Park'],
    '@id': `${selfUrl}#attraction`,
    name: SITE.fullName,
    alternateName: [
      `${SITE.fullName} (${SITE.city})`,
      ...SITE.alternateNames.filter((n) => n !== `${SITE.fullName} (${SITE.city})`),
    ],
    description: messages?.meta?.description,
    url: selfUrl,
    image: [OG_IMAGE_URL],
    telephone: SITE.phoneE164,
    isAccessibleForFree: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.streetAddress,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
      addressCountry: SITE.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.latitude,
      longitude: SITE.longitude,
    },
    hasMap: SITE.mapsShareUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: SITE.rating,
      reviewCount: Number(SITE.reviewCount.replace(/,/g, '')),
    },
    sameAs: [SITE.mapsShareUrl, SITE.govtTourismUrl],
  };

  // 2. FAQPage structured data — mirrors the visible FAQ section below
  const faqItems = (messages?.faqSection?.items || []) as Array<{ q: string; a: string }>;
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(attractionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <Header />
      <main>
        <Hero />
        <Intro />
        <BasicInfo />
        <Suspense fallback={null}>
          <WeatherForecast locale={locale} />
        </Suspense>
        <Suspense fallback={null}>
          <TideTimes locale={locale} />
        </Suspense>
        <HistoryTimeline />
        <CultureSection />
        <LocationSection />
        <NearbySection />
        <RouteSection />
        <HoursSection />
        <TicketsSection />
        <TransportSection />
        <AmenitiesSection />
        <Gallery />
        <Reviews />
        <MapEmbed />
        <FaqSection />
        <SourcesSection />
      </main>
      <Footer />
    </>
  );
}
