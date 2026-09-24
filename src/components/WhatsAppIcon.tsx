import React, { useId } from 'react';

interface WhatsAppIconProps {
  size?: number | string;
  className?: string;
  variant?: 'app-icon' | 'glyph-only';
}

/**
 * Komponen Ikon & Tombol WhatsApp resmi presisi tinggi
 * Variant 'app-icon' mereproduksi ikon WhatsApp gradient squircle persis seperti aset unggahan pengguna
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  size = 24,
  className = '',
  variant = 'app-icon',
}) => {
  const rawId = useId();
  const gradientId = `waGrad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  if (variant === 'glyph-only') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.301-.15-1.781-.879-2.056-.98-.276-.1-.476-.15-.676.15-.2.301-.776.98-.952 1.18-.175.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.084-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.526.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.629-.927-2.233-.244-.588-.492-.508-.676-.518-.175-.01-.376-.01-.577-.01-.201 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508s1.078 2.909 1.228 3.109c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.721.23 1.377.197 1.896.12.578-.087 1.781-.728 2.032-1.43.251-.702.251-1.304.175-1.43-.075-.125-.276-.2-.577-.35z" />
        <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.854.507 3.593 1.39 5.088L2 22l5.056-1.326A9.957 9.957 0 0 0 12.004 22C17.522 22 22 17.514 22 12.004 22 6.486 17.522 2 12.004 2zm0 18.286c-1.636 0-3.153-.48-4.428-1.307l-.317-.206-3.287.862.877-3.204-.226-.36A8.256 8.256 0 0 1 3.714 12.004C3.714 7.433 7.433 3.714 12.004 3.714c4.571 0 8.29 3.719 8.29 8.29 0 4.571-3.719 8.282-8.29 8.282z" />
      </svg>
    );
  }

  // Exact reproduction of the uploaded WhatsApp app icon asset (Squircle gradient + bubble + handset)
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#52EA61" />
          <stop offset="35%" stopColor="#3ADB58" />
          <stop offset="70%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#1BBA4F" />
        </linearGradient>
      </defs>
      {/* Skuirkel dengan lekukan sudut halus seperti di aset gambar */}
      <rect width="512" height="512" rx="112" fill={`url(#${gradientId})`} />
      {/* Cincin garis putih balon obrolan WhatsApp dengan ekor segitiga di kiri bawah */}
      <path
        d="M 206 364 L 136 376 L 154 316 A 122 122 0 1 1 206 364 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gagang telepon putih di tengah balon percakapan */}
      <g transform="translate(34.5, 18)">
        <path
          fill="#FFFFFF"
          d="M 320 286 C 314 283 286 269 281 267 C 276 265 272 264 269 270 C 265 275 255 287 252 290 C 249 294 246 294 240 291 C 235 288 217 282 196 263 C 179 248 168 230 165 224 C 162 219 165 216 168 213 C 170 211 173 207 176 203 C 178 200 179 197 181 193 C 183 189 182 186 181 183 C 179 180 168 152 163 141 C 158 130 154 132 150 132 C 147 132 143 132 139 132 C 135 132 129 133 124 139 C 119 144 105 157 105 185 C 105 212 125 238 128 242 C 130 245 168 304 226 329 C 240 335 251 339 259 341 C 273 346 285 345 295 344 C 306 342 328 330 333 317 C 338 303 338 292 336 289 C 334 287 330 285 325 283 Z"
        />
      </g>
    </svg>
  );
};
