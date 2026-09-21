import React from 'react';

interface KawacanaanEmblemProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const KawacanaanEmblem: React.FC<KawacanaanEmblemProps> = ({
  className = '',
  size = 64,
  alt = 'Emblem Resmi Kawacanaan',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      id="kawacanaan-emblem"
    >
      <img
        src="/lk.png"
        alt={alt}
        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm"
        onError={(e) => {
          // Fallback jika /lk.png sedang dimuat atau berada di path alternatif
          const target = e.currentTarget;
          if (target.src !== `${window.location.origin}/kawacanaan-logo.png`) {
            target.src = '/kawacanaan-logo.png';
          }
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
