import React from 'react';
import kawacanaanLogo from '../assets/images/kawacanaan_logo.png';

interface KawacanaanEmblemProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const KawacanaanEmblem: React.FC<KawacanaanEmblemProps> = ({
  className = '',
  size = 64,
  alt = 'Emblem Kawacanaan',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 select-none bg-[#0a0e14] border border-amber-500/20 shadow-md ${className}`}
      style={{ width: size, height: size }}
      id="kawacanaan-emblem"
    >
      <img
        src={kawacanaanLogo}
        alt={alt}
        className="w-full h-full object-contain p-0.5 hover:scale-105 transition-transform duration-300"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
