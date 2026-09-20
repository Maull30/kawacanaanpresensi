import React, { useState } from 'react';

/**
 * Mini Sparkline SVG for the top 5 metric cards
 */
export const MetricSparkline: React.FC<{
  color: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
  className?: string;
}> = ({ color, className = 'w-20 h-8' }) => {
  const colorMap = {
    blue: { stroke: '#3B82F6', fill: '#DBEAFE' },
    purple: { stroke: '#A855F7', fill: '#F3E8FF' },
    emerald: { stroke: '#10B981', fill: '#D1FAE5' },
    amber: { stroke: '#F59E0B', fill: '#FEF3C7' },
    rose: { stroke: '#F43F5E', fill: '#FFE4E6' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`overflow-hidden select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.fill} stopOpacity="0.8" />
            <stop offset="100%" stopColor={c.fill} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 32 Q 20 36, 35 24 T 65 28 T 85 14 L 100 12 L 100 40 L 0 40 Z"
          fill={`url(#sparkGrad-${color})`}
        />
        <path
          d="M 0 32 Q 20 36, 35 24 T 65 28 T 85 14 L 100 12"
          fill="none"
          stroke={c.stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/**
 * 30-Day System Activity Multi-Line Smooth Chart
 * Exactly matching the reference image curve lines, axes and styling.
 */
export const ActivityChart: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'login' | 'attendance' | 'transaction'>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dates = [
    '21 Agu', '24 Agu', '27 Agu', '30 Agu',
    '2 Sep', '5 Sep', '8 Sep', '11 Sep',
    '14 Sep', '17 Sep', '20 Sep',
  ];

  // 11 points for smooth curves
  const loginData = [1250, 1100, 1380, 1420, 1310, 1390, 1620, 1350, 1480, 1390, 1550];
  const attendanceData = [850, 750, 950, 920, 1020, 890, 1050, 850, 980, 920, 1080];
  const transactionData = [320, 240, 410, 380, 450, 400, 480, 420, 520, 490, 540];

  // SVG coordinate transformation:
  // Width: 600, Height: 220
  // Margins: Left: 45, Right: 20, Top: 15, Bottom: 35
  const chartW = 535;
  const chartH = 170;
  const startX = 45;
  const startY = 15;
  const maxVal = 2000;

  const getX = (index: number) => startX + (index / (dates.length - 1)) * chartW;
  const getY = (val: number) => startY + chartH - (val / maxVal) * chartH;

  const buildPath = (data: number[]) => {
    return data.reduce((acc, val, i, arr) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) return `M ${x} ${y}`;
      const prevX = getX(i - 1);
      const prevY = getY(arr[i - 1]);
      const cp1x = prevX + (x - prevX) / 2;
      const cp1y = prevY;
      const cp2x = prevX + (x - prevX) / 2;
      const cp2y = y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    }, '');
  };

  const loginPath = buildPath(loginData);
  const attendancePath = buildPath(attendanceData);
  const transactionPath = buildPath(transactionData);

  const loginArea = `${loginPath} L ${getX(dates.length - 1)} ${startY + chartH} L ${getX(0)} ${startY + chartH} Z`;

  const yTicks = [2000, 1500, 1000, 500, 0];

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between ${className}`}>
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-black text-slate-900 tracking-tight">
          Aktivitas Sistem 30 Hari Terakhir
        </h3>

        <div className="flex items-center gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="all">Semua Aktivitas</option>
            <option value="login">Hanya Login</option>
            <option value="attendance">Hanya Presensi</option>
            <option value="transaction">Hanya Transaksi</option>
          </select>
        </div>
      </div>

      {/* Legend Indicators */}
      <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-slate-600">
        {(selectedFilter === 'all' || selectedFilter === 'login') && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Login</span>
          </div>
        )}
        {(selectedFilter === 'all' || selectedFilter === 'attendance') && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Presensi</span>
          </div>
        )}
        {(selectedFilter === 'all' || selectedFilter === 'transaction') && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Transaksi</span>
          </div>
        )}
      </div>

      {/* Interactive Chart Area */}
      <div className="relative mt-4 w-full aspect-[21/9] min-h-[190px]">
        <svg
          viewBox="0 0 600 220"
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="loginAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={startX}
                  y1={y}
                  x2={startX + chartW}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1.2"
                />
                <text
                  x={startX - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#94A3B8"
                >
                  {val === 0 ? '0' : val.toLocaleString('id-ID')}
                </text>
              </g>
            );
          })}

          {/* Area Fill under Login line */}
          {(selectedFilter === 'all' || selectedFilter === 'login') && (
            <path d={loginArea} fill="url(#loginAreaGrad)" />
          )}

          {/* Wave Lines */}
          {(selectedFilter === 'all' || selectedFilter === 'login') && (
            <path
              d={loginPath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {(selectedFilter === 'all' || selectedFilter === 'attendance') && (
            <path
              d={attendancePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {(selectedFilter === 'all' || selectedFilter === 'transaction') && (
            <path
              d={transactionPath}
              fill="none"
              stroke="#A855F7"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}

          {/* X-Axis Labels */}
          {dates.map((date, i) => {
            const x = getX(i);
            const isHovered = hoverIndex === i;
            return (
              <g key={date}>
                <text
                  x={x}
                  y={startY + chartH + 18}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#1E293B' : '#94A3B8'}
                >
                  {date}
                </text>

                {/* Invisible Hover Hitbox for column */}
                <rect
                  x={x - chartW / dates.length / 2}
                  y={startY}
                  width={chartW / dates.length}
                  height={chartH + 20}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              </g>
            );
          })}

          {/* Active Hover Guide Line and Dots */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={startY}
                x2={getX(hoverIndex)}
                y2={startY + chartH}
                stroke="#94A3B8"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />

              {/* Login Dot */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(loginData[hoverIndex])}
                r="4.5"
                fill="#3B82F6"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="drop-shadow-xs"
              />

              {/* Attendance Dot */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(attendanceData[hoverIndex])}
                r="4.5"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="drop-shadow-xs"
              />

              {/* Transaction Dot */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(transactionData[hoverIndex])}
                r="4.5"
                fill="#A855F7"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="drop-shadow-xs"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip when hovered */}
        {hoverIndex !== null && (
          <div
            className="absolute -top-3 pointer-events-none bg-slate-900/90 backdrop-blur-xs text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg z-20 transition-all font-mono"
            style={{
              left: `${(getX(hoverIndex) / 600) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-0.5 mb-1">
              {dates[hoverIndex]}
            </div>
            <div className="text-blue-400">Login: {loginData[hoverIndex].toLocaleString('id-ID')}</div>
            <div className="text-emerald-400">Presensi: {attendanceData[hoverIndex].toLocaleString('id-ID')}</div>
            <div className="text-purple-400">Transaksi: {transactionData[hoverIndex].toLocaleString('id-ID')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Tenant Distribution Donut Chart
 * Matching the exact circular donut layout + legend on the right side from reference image.
 */
export const TenantDonutChart: React.FC<{
  onViewAll?: () => void;
  schools?: any[];
}> = ({ onViewAll, schools = [] }) => {
  // 4 items matching reference image
  const tenants = [
    { name: 'SDN KAWUNG LUWUK', count: 1, color: '#3B82F6' },
    { name: 'SD Uji Keamanan', count: 2, color: '#10B981' },
    { name: 'SMPN 1', count: 1, color: '#06B6D4' },
    { name: 'SMA 1', count: 1, color: '#8B5CF6' },
  ];

  const total = tenants.reduce((acc, t) => acc + t.count, 0);

  // SVG Donut calculation
  const size = 130;
  const center = size / 2;
  const radius = 45;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-50">
        <h3 className="text-sm font-black text-slate-900 tracking-tight">
          Distribusi Tenant (Sekolah)
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            Lihat Semua &gt;
          </button>
        )}
      </div>

      {/* Chart and Legend Row */}
      <div className="flex items-center justify-between gap-4 my-auto pt-3">
        {/* Donut Circle */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
            {tenants.map((t, i) => {
              const percent = t.count / total;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += percent;

              return (
                <circle
                  key={t.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={t.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
            <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-1">Tenant Aktif</span>
          </div>
        </div>

        {/* Legend List on the right */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {tenants.map((t) => (
            <div key={t.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-slate-700 font-bold truncate max-w-[110px]" title={t.name}>
                  {t.name}
                </span>
              </div>
              <span className="text-slate-500 font-bold font-mono ml-2 shrink-0">{t.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
