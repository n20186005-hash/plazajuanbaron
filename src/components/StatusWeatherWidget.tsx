'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function StatusWeatherWidget() {
  const t = useTranslations('hero');
  const [isOpen, setIsOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const checkStatus = () => {
      // Santo Domingo is in America/Santo_Domingo (UTC-4)
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Santo_Domingo',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      };
      
      const timeInSD = now.toLocaleTimeString('en-US', options);
      setTimeStr(timeInSD);
      
      const hour = parseInt(timeInSD.split(':')[0], 10);
      
      // Open between 16:00 and 00:00 (which means 16 to 23)
      if (hour >= 16 || hour === 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 mt-4">
      {/* Status */}
      <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-white text-sm font-medium">
          {isOpen ? t('statusOpen') : t('statusClosed')}
        </span>
      </div>

      {/* Weather/Sunset Mock Widget */}
      <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-xl">🌤️</span>
        <span className="text-white text-sm font-medium">28°C • {t('sunset')} ~18:30</span>
      </div>
    </div>
  );
}
