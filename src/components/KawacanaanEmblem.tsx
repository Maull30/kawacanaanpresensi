import React from 'react';
import { usePlatformBrand, DEFAULT_PLATFORM_LOGO } from '../utils/platformBranding';

interface KawacanaanEmblemProps {
  className?: string;
  size?: number;
  alt?: string;
  src?: string;
}

export const KawacanaanEmblem: React.FC<KawacanaanEmblemProps> = ({
  className = '',
  size = 64,
  alt = 'Emblem Resmi Kawacanaan',
  src,
}) => {
  const { logoUrl } = usePlatformBrand();
  const activeSrc = src || logoUrl || DEFAULT_PLATFORM_LOGO;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      id="kawacanaan-emblem"
    >
      <img
        key={activeSrc}
        src={activeSrc}
        alt={alt}
        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm"
        onError={(e) => {
          // Fallback jika logo custom gagal dimuat
          const target = e.currentTarget;
          if (target.src !== `${window.location.origin}/lk.png` && !target.src.endsWith('/lk.png')) {
            target.src = '/lk.png';
          } else if (target.src !== `${window.location.origin}/kawacanaan-logo.png` && !target.src.endsWith('/kawacanaan-logo.png')) {
            target.src = '/kawacanaan-logo.png';
          }
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

