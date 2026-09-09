'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker so the site can be installed
 * and works offline for returning visitors.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (window.location.protocol !== 'https:' && !isLocal) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
