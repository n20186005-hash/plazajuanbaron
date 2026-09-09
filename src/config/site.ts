/**
 * Centralized single-attraction entity configuration.
 * Replace the values below to re-purpose this template for another attraction.
 */
export const SITE = {
  domain: 'plazajuanbaron.com',
  baseUrl: 'https://plazajuanbaron.com',

  // ---- Entity: Plaza Juan Barón (Santo Domingo) ----
  fullName: 'Plaza Juan Barón',
  alternateNames: ['Plaza Juan Barón (Santo Domingo)', 'Juan Barón Square', 'Parque Plaza Juan Barón'],
  city: 'Santo Domingo',
  region: 'Distrito Nacional',
  country: 'Dominican Republic',
  countryCode: 'DO',
  postalCode: '10208',
  streetAddress: 'P.º Pdte. Billini',
  plusCode: 'F474+RWW',
  latitude: 18.4646216,
  longitude: -69.8926837,

  // NAP — must match Google Business Profile exactly
  phoneDisplay: '+1 809-689-9476',
  phoneE164: '+18096899476',
  rating: '4.5',
  reviewCount: '10,991',

  // ---- Maps ----
  mapsShareUrl: 'https://maps.app.goo.gl/fCbQA7H9PcK9PDJF6',
  mapsEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6726.215378040124!2d-69.8926837!3d18.464621599999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf8822db2c74f3%3A0xd5191b587ca2ea60!2sPlaza%20Juan%20Bar%C3%B3n!5e1!3m2!1szh-CN!2s!4v1788945275882!5m2!1szh-CN!2s',

  // ---- Media ----
  heroImage: '/gallery/plaza-juan-baron-1.jpg',

  // ---- Official / authority references ----
  govtTourismUrl: 'https://www.godominicanrepublic.com/',
  govtTourismMinistryUrl: 'https://www.mitur.gob.do/',
  govtCityHallUrl: 'https://adn.gob.do/',
  unescoUrl: 'https://whc.unesco.org/en/list/526/',

  // ---- Nearby semantic landmarks ----
  nearbyLandmark1: 'Malecón de Santo Domingo',
  nearbyLandmark2: 'Ciudad Colonial (Zona Colonial)',

  // ---- Third party ----
  ga4Id: 'G-HXM22WWPKP',
} as const;

export const OG_IMAGE_URL = `${SITE.baseUrl}/gallery/plaza-juan-baron-1.jpg`;
