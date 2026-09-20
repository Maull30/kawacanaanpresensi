import React from 'react';

/**
 * 3D Isometric / Angled Laptop Illustration with live Kawacanaan Dashboard preview
 * and a floating green security badge shield matching the reference image.
 */
export const LaptopIllustration: React.FC<{ className?: string }> = ({ className = "w-48 h-32" }) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 280 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        <defs>
          <linearGradient id="laptopBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="laptopScreenBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="screenDisplayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floating subtle ambient glow */}
        <ellipse cx="140" cy="145" rx="100" ry="18" fill="#3B82F6" opacity="0.25" />

        {/* Laptop Base (Keyboard bottom plate) - Angled 3D */}
        <path
          d="M 50 135 L 205 135 L 235 155 L 25 155 Z"
          fill="url(#laptopBodyGrad)"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        {/* Laptop Base Front Lip */}
        <path
          d="M 25 155 L 235 155 L 233 160 L 27 160 Z"
          fill="#64748B"
        />
        {/* Trackpad */}
        <path
          d="M 112 145 L 148 145 L 152 152 L 108 152 Z"
          fill="#CBD5E1"
          stroke="#94A3B8"
          strokeWidth="0.8"
        />

        {/* Keyboard keys subtle representation */}
        <path
          d="M 60 137 L 195 137 L 192 143 L 57 143 Z"
          fill="#475569"
          opacity="0.7"
        />

        {/* Laptop Screen Display Lid (Upright angled backwards) */}
        <g transform="matrix(0.96, -0.12, 0.16, 0.98, 20, 10)">
          {/* Bezel */}
          <rect
            x="50"
            y="22"
            width="155"
            height="105"
            rx="8"
            fill="url(#laptopScreenBezel)"
            stroke="#64748B"
            strokeWidth="2"
          />
          {/* Screen Inner Display */}
          <rect
            x="56"
            y="28"
            width="143"
            height="93"
            rx="4"
            fill="url(#screenDisplayGrad)"
          />

          {/* Screen UI: Topbar */}
          <rect x="56" y="28" width="143" height="12" fill="#2563EB" />
          <circle cx="63" cy="34" r="2" fill="#93C5FD" />
          <rect x="70" y="32" width="28" height="4" rx="2" fill="#BFDBFE" />
          <circle cx="190" cy="34" r="2.5" fill="#DBEAFE" />

          {/* Screen UI: Sidebar */}
          <rect x="56" y="40" width="22" height="81" fill="#1E293B" />
          <rect x="60" y="45" width="14" height="3" rx="1.5" fill="#3B82F6" />
          <rect x="60" y="52" width="14" height="2.5" rx="1" fill="#64748B" />
          <rect x="60" y="58" width="14" height="2.5" rx="1" fill="#64748B" />
          <rect x="60" y="64" width="14" height="2.5" rx="1" fill="#64748B" />

          {/* Screen UI: Main Content Cards */}
          <rect x="83" y="44" width="32" height="16" rx="2" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="0.8" />
          <rect x="86" y="47" width="10" height="2.5" rx="1" fill="#3B82F6" />
          <rect x="86" y="52" width="16" height="5" rx="1" fill="#1E3A8A" />

          <rect x="120" y="44" width="32" height="16" rx="2" fill="#FAF5FF" stroke="#F3E8FF" strokeWidth="0.8" />
          <rect x="123" y="47" width="10" height="2.5" rx="1" fill="#9333EA" />
          <rect x="123" y="52" width="16" height="5" rx="1" fill="#581C87" />

          <rect x="157" y="44" width="37" height="16" rx="2" fill="#ECFDF5" stroke="#D1FAE5" strokeWidth="0.8" />
          <rect x="160" y="47" width="10" height="2.5" rx="1" fill="#10B981" />
          <rect x="160" y="52" width="16" height="5" rx="1" fill="#065F46" />

          {/* Screen UI: Graph Area */}
          <rect x="83" y="65" width="111" height="48" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
          <path
            d="M 88 100 Q 105 85, 120 92 T 150 78 T 188 74"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 88 105 Q 105 98, 120 102 T 150 90 T 188 88"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Floating Green Security Shield Badge (Matching Reference Right Side) */}
        <g transform="translate(225, 45)" className="animate-pulse">
          <ellipse cx="18" cy="22" rx="16" ry="18" fill="#10B981" opacity="0.3" filter="url(#softGlow)" />
          <path
            d="M 18 6 L 31 11 C 31 23 25 33 18 38 C 11 33 5 23 5 11 Z"
            fill="url(#shieldGrad)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />
          {/* White Checkmark */}
          <path
            d="M 12 21 L 16 25 L 24 16"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * 3D Server Rack & Shield Illustration for the "Sistem Berjalan Normal" card
 */
export const ServerRackIllustration: React.FC<{ className?: string }> = ({ className = "w-28 h-20" }) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="serverShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <filter id="serverGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="70" cy="100" rx="45" ry="10" fill="#93C5FD" opacity="0.3" />

        {/* Server Block Layer 3 (Bottom) */}
        <g transform="translate(30, 68)">
          <path d="M 10 6 L 60 6 L 75 18 L 25 18 Z" fill="#3B82F6" />
          <path d="M 10 6 L 25 18 L 25 32 L 10 20 Z" fill="#1D4ED8" />
          <path d="M 25 18 L 75 18 L 75 32 L 25 32 Z" fill="#1E3A8A" />
          <circle cx="33" cy="25" r="2" fill="#34D399" />
          <circle cx="41" cy="25" r="2" fill="#60A5FA" />
          <line x1="50" y1="25" x2="68" y2="25" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Server Block Layer 2 (Middle) */}
        <g transform="translate(30, 46)">
          <path d="M 10 6 L 60 6 L 75 18 L 25 18 Z" fill="#3B82F6" />
          <path d="M 10 6 L 25 18 L 25 32 L 10 20 Z" fill="#1D4ED8" />
          <path d="M 25 18 L 75 18 L 75 32 L 25 32 Z" fill="#1E3A8A" />
          <circle cx="33" cy="25" r="2" fill="#34D399" />
          <circle cx="41" cy="25" r="2" fill="#FBBF24" />
          <line x1="50" y1="25" x2="68" y2="25" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Server Block Layer 1 (Top) */}
        <g transform="translate(30, 24)">
          <path d="M 10 6 L 60 6 L 75 18 L 25 18 Z" fill="#60A5FA" />
          <path d="M 10 6 L 25 18 L 25 32 L 10 20 Z" fill="#2563EB" />
          <path d="M 25 18 L 75 18 L 75 32 L 25 32 Z" fill="#1E3A8A" />
          <circle cx="33" cy="25" r="2" fill="#34D399" />
          <circle cx="41" cy="25" r="2" fill="#34D399" />
          <line x1="50" y1="25" x2="68" y2="25" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating Shield on the Right */}
        <g transform="translate(100, 48)">
          <ellipse cx="18" cy="22" rx="16" ry="18" fill="#3B82F6" opacity="0.3" filter="url(#serverGlow)" />
          <path
            d="M 18 6 L 31 11 C 31 23 25 33 18 38 C 11 33 5 23 5 11 Z"
            fill="url(#serverShield)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />
          <path
            d="M 12 21 L 16 25 L 24 16"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * 3D Front School Building Illustration with clouds and pillars
 * matching the header banner in the reference image.
 */
export const SchoolBuildingIllustration: React.FC<{ className?: string }> = ({ className = "w-36 h-20" }) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 200 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </linearGradient>
          <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>

        {/* Floating Soft Blue Clouds */}
        <path
          d="M 20 50 Q 20 40 30 40 Q 35 30 48 32 Q 60 30 65 40 Q 75 40 75 50 Z"
          fill="url(#cloudGrad)"
        />
        <path
          d="M 135 45 Q 135 35 145 35 Q 150 25 163 27 Q 175 25 180 35 Q 190 35 190 45 Z"
          fill="url(#cloudGrad)"
        />

        {/* Base Foundation / Steps */}
        <rect x="40" y="88" width="120" height="6" rx="2" fill="#93C5FD" />
        <rect x="48" y="84" width="104" height="5" rx="1.5" fill="#BFDBFE" />

        {/* Left Wing Building */}
        <rect x="46" y="52" width="34" height="34" rx="2" fill="url(#wallGrad)" stroke="#60A5FA" strokeWidth="1.2" />
        {/* Left Wing Roof */}
        <path d="M 44 52 L 63 38 L 82 52 Z" fill="url(#roofGrad)" />
        {/* Left Windows */}
        <rect x="52" y="58" width="8" height="10" rx="1" fill="#3B82F6" />
        <rect x="66" y="58" width="8" height="10" rx="1" fill="#3B82F6" />
        <rect x="52" y="72" width="8" height="8" rx="1" fill="#60A5FA" />
        <rect x="66" y="72" width="8" height="8" rx="1" fill="#60A5FA" />

        {/* Right Wing Building */}
        <rect x="120" y="52" width="34" height="34" rx="2" fill="url(#wallGrad)" stroke="#60A5FA" strokeWidth="1.2" />
        {/* Right Wing Roof */}
        <path d="M 118 52 L 137 38 L 156 52 Z" fill="url(#roofGrad)" />
        {/* Right Windows */}
        <rect x="126" y="58" width="8" height="10" rx="1" fill="#3B82F6" />
        <rect x="140" y="58" width="8" height="10" rx="1" fill="#3B82F6" />
        <rect x="126" y="72" width="8" height="8" rx="1" fill="#60A5FA" />
        <rect x="140" y="72" width="8" height="8" rx="1" fill="#60A5FA" />

        {/* Main Central Tower */}
        <rect x="76" y="40" width="48" height="46" rx="2" fill="url(#wallGrad)" stroke="#3B82F6" strokeWidth="1.4" />
        
        {/* Main Center Triangular Pediment */}
        <path d="M 72 40 L 100 18 L 128 40 Z" fill="url(#roofGrad)" stroke="#2563EB" strokeWidth="1" />
        
        {/* Clock Tower / Small Bell Spire */}
        <rect x="94" y="10" width="12" height="12" rx="2" fill="url(#wallGrad)" stroke="#3B82F6" strokeWidth="1" />
        <path d="M 92 10 L 100 2 L 108 10 Z" fill="#1D4ED8" />
        <circle cx="100" cy="16" r="3.5" fill="#3B82F6" />
        {/* Small Flag on top */}
        <line x1="100" y1="2" x2="100" y2="-4" stroke="#1E40AF" strokeWidth="1.2" />
        <path d="M 100 -4 L 108 -1 L 100 2 Z" fill="#EF4444" />

        {/* Central Entrance Pillars (4 Pillars) */}
        <rect x="80" y="44" width="4" height="40" rx="1" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.8" />
        <rect x="89" y="44" width="4" height="40" rx="1" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.8" />
        <rect x="107" y="44" width="4" height="40" rx="1" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.8" />
        <rect x="116" y="44" width="4" height="40" rx="1" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.8" />

        {/* Grand Arch Doorway */}
        <path
          d="M 94 84 L 94 65 C 94 60 106 60 106 65 L 106 84 Z"
          fill="url(#doorGrad)"
          stroke="#1E3A8A"
          strokeWidth="1"
        />
        <line x1="100" y1="63" x2="100" y2="84" stroke="#93C5FD" strokeWidth="0.8" />

        {/* Round decorative window on Central Pediment */}
        <circle cx="100" cy="30" r="5" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
        <line x1="100" y1="25" x2="100" y2="35" stroke="#3B82F6" strokeWidth="0.8" />
        <line x1="95" y1="30" x2="105" y2="30" stroke="#3B82F6" strokeWidth="0.8" />
      </svg>
    </div>
  );
};
