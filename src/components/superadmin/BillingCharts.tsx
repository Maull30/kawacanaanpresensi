import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet,
  Building,
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ChevronRight,
  Headphones,
  Download,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

/**
 * 1. Sparkline Mini Chart for KPI Cards
 */
export const MiniSparkline: React.FC<{
  type: 'blue' | 'green' | 'red' | 'teal';
  className?: string;
}> = ({ type, className = "w-20 h-8" }) => {
  const configs = {
    blue: {
      stroke: '#3B82F6',
      fill: 'url(#sparkGradBlue)',
      d: 'M 0 24 Q 15 22 25 15 T 45 18 T 65 8 T 80 4',
      area: 'M 0 24 Q 15 22 25 15 T 45 18 T 65 8 T 80 4 L 80 32 L 0 32 Z',
      gradId: 'sparkGradBlue',
      gradColor: '#3B82F6',
    },
    green: {
      stroke: '#10B981',
      fill: 'url(#sparkGradGreen)',
      d: 'M 0 26 Q 15 20 28 22 T 50 12 T 68 14 T 80 5',
      area: 'M 0 26 Q 15 20 28 22 T 50 12 T 68 14 T 80 5 L 80 32 L 0 32 Z',
      gradId: 'sparkGradGreen',
      gradColor: '#10B981',
    },
    red: {
      stroke: '#F43F5E',
      fill: 'url(#sparkGradRed)',
      d: 'M 0 22 Q 18 25 32 16 T 52 20 T 66 10 T 80 6',
      area: 'M 0 22 Q 18 25 32 16 T 52 20 T 66 10 T 80 6 L 80 32 L 0 32 Z',
      gradId: 'sparkGradRed',
      gradColor: '#F43F5E',
    },
    teal: {
      stroke: '#06B6D4',
      fill: 'url(#sparkGradTeal)',
      d: 'M 0 25 Q 16 18 30 20 T 52 10 T 68 12 T 80 4',
      area: 'M 0 25 Q 16 18 30 20 T 52 10 T 68 12 T 80 4 L 80 32 L 0 32 Z',
      gradId: 'sparkGradTeal',
      gradColor: '#06B6D4',
    },
  };

  const c = configs[type];

  return (
    <div className={`shrink-0 select-none ${className}`}>
      <svg viewBox="0 0 80 32" fill="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={c.gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.gradColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={c.gradColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={c.area} fill={c.fill} />
        <path d={c.d} stroke={c.stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/**
 * 2. Interactive 6-Month Revenue & Arrears Trend Line Chart
 * Matches the reference image:
 * Y-Axis: 250 jt, 200 jt, 150 jt, 100 jt, 50 jt, 0
 * X-Axis: Mar 2026, Apr 2026, Mei 2026, Jun 2026, Jul 2026, Agu 2026
 * Curves: Total Pembayaran (Blue) & Tunggakan (Orange)
 */
export const RevenueTrendChart: React.FC = () => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const months = [
    { label: 'Mar 2026', revenue: 108000000, revenueFormatted: 'Rp 108 jt', arrears: 24000000, arrearsFormatted: 'Rp 24 jt', x: 45 },
    { label: 'Apr 2026', revenue: 132000000, revenueFormatted: 'Rp 132 jt', arrears: 21000000, arrearsFormatted: 'Rp 21 jt', x: 125 },
    { label: 'Mei 2026', revenue: 145000000, revenueFormatted: 'Rp 145 jt', arrears: 28000000, arrearsFormatted: 'Rp 28 jt', x: 205 },
    { label: 'Jun 2026', revenue: 182000000, revenueFormatted: 'Rp 182 jt', arrears: 19000000, arrearsFormatted: 'Rp 19 jt', x: 285 },
    { label: 'Jul 2026', revenue: 175000000, revenueFormatted: 'Rp 175 jt', arrears: 44000000, arrearsFormatted: 'Rp 44 jt', x: 365 },
    { label: 'Agu 2026', revenue: 238000000, revenueFormatted: 'Rp 238 jt', arrears: 32000000, arrearsFormatted: 'Rp 32 jt', x: 445 },
  ];

  // Max value is 250 jt (height mapping: y=20 to y=180, range 160)
  const getY = (val: number) => {
    const maxVal = 250000000;
    const ratio = Math.min(1, Math.max(0, val / maxVal));
    return 180 - ratio * 160;
  };

  // SVG paths for smooth Bezier curves
  const revenuePoints = months.map(m => ({ x: m.x, y: getY(m.revenue) }));
  const arrearsPoints = months.map(m => ({ x: m.x, y: getY(m.arrears) }));

  // Helper to create cubic bezier SVG path string
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    return pts.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (pt.x - prev.x) / 2;
      const cpY2 = pt.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const revenueLinePath = createSmoothPath(revenuePoints);
  const arrearsLinePath = createSmoothPath(arrearsPoints);

  const revenueAreaPath = `${revenueLinePath} L ${months[months.length - 1].x} 180 L ${months[0].x} 180 Z`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tren Pembayaran 6 Bulan Terakhir</h3>
            <p className="text-[11px] text-slate-400">Total penerimaan vs tagihan belum dibayar</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3.5 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100" />
            <span className="text-slate-600 text-[11px]">Total Pembayaran</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" />
            <span className="text-slate-600 text-[11px]">Tunggakan</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden mt-3 pt-2">
        <svg
          viewBox="0 0 500 215"
          className="w-full h-auto overflow-visible select-none text-[10px]"
          fill="none"
        >
          <defs>
            <linearGradient id="chartRevenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-Axis labels */}
          {[
            { label: '250 jt', val: 250000000 },
            { label: '200 jt', val: 200000000 },
            { label: '150 jt', val: 150000000 },
            { label: '100 jt', val: 100000000 },
            { label: '50 jt', val: 50000000 },
            { label: '0', val: 0 },
          ].map((grid, i) => {
            const y = getY(grid.val);
            return (
              <g key={i}>
                <text x="32" y={y + 3.5} textAnchor="end" fill="#94A3B8" className="font-medium text-[9.5px]">
                  {grid.label}
                </text>
                <line
                  x1="45"
                  y1={y}
                  x2="475"
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={i === 5 ? "none" : "3 3"}
                />
              </g>
            );
          })}

          {/* Shaded Area under Blue Curve */}
          <path d={revenueAreaPath} fill="url(#chartRevenueGrad)" />

          {/* Orange Curve: Tunggakan */}
          <path
            d={arrearsLinePath}
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Blue Curve: Total Pembayaran */}
          <path
            d={revenueLinePath}
            stroke="#3B82F6"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points and Interactivity */}
          {months.map((m, idx) => {
            const ry = getY(m.revenue);
            const ay = getY(m.arrears);
            const isHovered = hoveredMonth === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredMonth(idx)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Vertical hover guide bar */}
                {isHovered && (
                  <line
                    x1={m.x}
                    y1={15}
                    x2={m.x}
                    y2={180}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                )}

                {/* X-Axis Label */}
                <text
                  x={m.x}
                  y="200"
                  textAnchor="middle"
                  fill={isHovered ? "#1E293B" : "#64748B"}
                  className={`font-semibold transition-colors ${isHovered ? 'text-[10.5px] font-bold' : 'text-[9.5px]'}`}
                >
                  {m.label}
                </text>

                {/* Orange Dot */}
                <circle
                  cx={m.x}
                  cy={ay}
                  r={isHovered ? 5.5 : 4}
                  fill="#FFFFFF"
                  stroke="#F59E0B"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150 drop-shadow-xs"
                />

                {/* Blue Dot */}
                <circle
                  cx={m.x}
                  cy={ry}
                  r={isHovered ? 6 : 4.5}
                  fill="#FFFFFF"
                  stroke="#3B82F6"
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  className="transition-all duration-150 drop-shadow-xs"
                />

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.max(10, Math.min(410, m.x - 55))}
                      y={Math.max(10, ry - 46)}
                      width="110"
                      height="38"
                      rx="6"
                      fill="#0F172A"
                      className="drop-shadow-lg"
                    />
                    <text
                      x={Math.max(10, Math.min(410, m.x - 55)) + 8}
                      y={Math.max(10, ry - 46) + 15}
                      fill="#93C5FD"
                      className="text-[9px] font-bold"
                    >
                      ● Masuk: {m.revenueFormatted}
                    </text>
                    <text
                      x={Math.max(10, Math.min(410, m.x - 55)) + 8}
                      y={Math.max(10, ry - 46) + 29}
                      fill="#FCD34D"
                      className="text-[9px] font-bold"
                    >
                      ● Tunggak: {m.arrearsFormatted}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-2 mt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500">
        <span>Kuartal 3 & 4 Tahun Ajaran 2026/2027</span>
        <span className="text-emerald-600 font-bold flex items-center gap-1">
          <ArrowUpRight size={13} /> +34.2% Efisiensi Penagihan
        </span>
      </div>
    </div>
  );
};

/**
 * 3. Donut Chart for Payment Methods
 * Transfer Bank: 58.1% (Blue)
 * Virtual Account: 22.6% (Green/Mint)
 * QRIS: 12.5% (Purple)
 * E-Wallet: 6.8% (Orange)
 * Center hole displays: "248" + "Transaksi"
 */
export const PaymentMethodDonut: React.FC = () => {
  const methods = [
    { label: 'Transfer Bank', pct: 58.1, count: 144, color: '#3B82F6', textClass: 'text-blue-600', dotClass: 'bg-blue-500' },
    { label: 'Virtual Account', pct: 22.6, count: 56, color: '#10B981', textClass: 'text-emerald-600', dotClass: 'bg-emerald-500' },
    { label: 'QRIS', pct: 12.5, count: 31, color: '#8B5CF6', textClass: 'text-purple-600', dotClass: 'bg-purple-500' },
    { label: 'E-Wallet', pct: 6.8, count: 17, color: '#F59E0B', textClass: 'text-amber-500', dotClass: 'bg-amber-500' },
  ];

  // Circumference of radius 52 is 2 * PI * 52 ≈ 326.7
  const circumference = 326.7;

  // Calculate stroke-dasharray and offsets
  const seg1 = (58.1 / 100) * circumference;
  const seg2 = (22.6 / 100) * circumference;
  const seg3 = (12.5 / 100) * circumference;
  const seg4 = (6.8 / 100) * circumference;

  const offset1 = 0;
  const offset2 = -seg1;
  const offset3 = -(seg1 + seg2);
  const offset4 = -(seg1 + seg2 + seg3);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PieChart size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Metode Pembayaran</h3>
            <p className="text-[11px] text-slate-400">Distribusi kanal transaksi</p>
          </div>
        </div>
      </div>

      {/* Donut & Legend Container */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
        {/* SVG Donut Graphic */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="16"
            />
            {/* Segment 1: Transfer Bank */}
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="transparent"
              stroke="#3B82F6"
              strokeWidth="16"
              strokeDasharray={`${seg1} ${circumference - seg1}`}
              strokeDashoffset={offset1}
              strokeLinecap="round"
            />
            {/* Segment 2: Virtual Account */}
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="transparent"
              stroke="#10B981"
              strokeWidth="16"
              strokeDasharray={`${seg2} ${circumference - seg2}`}
              strokeDashoffset={offset2}
              strokeLinecap="round"
            />
            {/* Segment 3: QRIS */}
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="transparent"
              stroke="#8B5CF6"
              strokeWidth="16"
              strokeDasharray={`${seg3} ${circumference - seg3}`}
              strokeDashoffset={offset3}
              strokeLinecap="round"
            />
            {/* Segment 4: E-Wallet */}
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="transparent"
              stroke="#F59E0B"
              strokeWidth="16"
              strokeDasharray={`${seg4} ${circumference - seg4}`}
              strokeDashoffset={offset4}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Hole Text: 248 Transaksi */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none">248</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Transaksi</span>
          </div>
        </div>

        {/* Legend Right / Bottom */}
        <div className="w-full sm:w-auto space-y-2.5 text-xs">
          {methods.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-2 min-w-[110px]">
                <span className={`w-2.5 h-2.5 rounded-full ${m.dotClass}`} />
                <span className="font-medium text-slate-700 text-[11px] truncate">{m.label}</span>
              </div>
              <span className="font-black text-slate-900 text-xs">{m.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 mt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
        <span>BCA & Mandiri kanal terfavorit</span>
        <span className="font-semibold text-blue-600 cursor-pointer hover:underline">
          Detail kanal →
        </span>
      </div>
    </div>
  );
};

/**
 * 4. Aksi Cepat (Quick Actions)
 * - Buat Tagihan
 * - Lihat Semua Transaksi
 * - Laporan Keuangan
 * - Pengaturan Metode Pembayaran
 */
export const BillingQuickActions: React.FC<{
  onOpenCreateBill: () => void;
  onViewAllTransactions: () => void;
  onOpenFinancialReport: () => void;
  onOpenPaymentSettings: () => void;
}> = ({
  onOpenCreateBill,
  onViewAllTransactions,
  onOpenFinancialReport,
  onOpenPaymentSettings
}) => {
  const actions = [
    {
      id: 'create-bill',
      title: 'Buat Tagihan',
      desc: 'Generate tagihan baru',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600',
      onClick: onOpenCreateBill,
    },
    {
      id: 'view-all',
      title: 'Lihat Semua Transaksi',
      desc: 'Riwayat pembayaran',
      icon: Wallet,
      iconBg: 'bg-emerald-50 text-emerald-600',
      onClick: onViewAllTransactions,
    },
    {
      id: 'report',
      title: 'Laporan Keuangan',
      desc: 'Download laporan',
      icon: Download,
      iconBg: 'bg-purple-50 text-purple-600',
      onClick: onOpenFinancialReport,
    },
    {
      id: 'settings',
      title: 'Pengaturan Metode Pembayaran',
      desc: 'Kelola metode & rekening',
      icon: SlidersHorizontal,
      iconBg: 'bg-amber-50 text-amber-600',
      onClick: onOpenPaymentSettings,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Clock size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Aksi Cepat</h3>
          <p className="text-[11px] text-slate-400">Pintasan operasional billing</p>
        </div>
      </div>

      {/* 4 Action Buttons */}
      <div className="space-y-2 my-auto py-1">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 transition-all duration-150 cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={17} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {act.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {act.desc}
                  </div>
                </div>
              </div>

              <ChevronRight size={15} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Integrasi Midtrans Otomatis</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
      </div>
    </div>
  );
};

/**
 * 5. Feed Aktivitas Terbaru & Widget Bantuan (Right Sidebar Column)
 */
export const RecentActivitiesFeed: React.FC<{
  onOpenSupport: () => void;
  onViewAllActivities: () => void;
}> = ({ onOpenSupport, onViewAllActivities }) => {
  const activities = [
    {
      id: 'act-1',
      title: 'Pembayaran berhasil',
      subtitle: 'Rina Putri - SDN KAWUNG LUWUK',
      amount: 'Rp 25.000',
      time: '10:24',
      type: 'success',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'act-2',
      title: 'Tagihan baru dibuat',
      subtitle: 'Andi Saputra - SMKN 1 Luwuk',
      amount: 'Rp 150.000',
      time: '09:50',
      type: 'purple',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'act-3',
      title: 'Pembayaran berhasil',
      subtitle: 'Siti Nurhaliza - SMPN 1 Luwuk',
      amount: 'Rp 75.000',
      time: '16:43',
      type: 'success',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'act-4',
      title: 'Tunggakan terdeteksi',
      subtitle: 'Budi Santoso - SMK Negeri 1 Luwuk',
      amount: 'Rp 120.000',
      time: '14:20',
      type: 'danger',
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'act-5',
      title: 'Laporan bulanan selesai',
      subtitle: 'Rekap pembayaran September 2026',
      amount: '',
      time: '12:10',
      type: 'info',
      icon: FileSpreadsheet,
      color: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Aktivitas Terbaru Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Aktivitas Terbaru</h3>
          </div>
          <button
            type="button"
            onClick={onViewAllActivities}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Lihat Semua &gt;
          </button>
        </div>

        {/* Activity Items List */}
        <div className="divide-y divide-slate-100 space-y-2">
          {activities.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate leading-snug">
                      {item.title}
                    </div>
                    <div className="text-[10.5px] text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {item.amount && (
                    <div className={`text-[11px] font-bold ${item.type === 'danger' ? 'text-rose-600' : 'text-slate-800'}`}>
                      {item.amount}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {item.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Widget Butuh Bantuan? */}
      <div
        onClick={onOpenSupport}
        className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-100 flex items-center justify-between cursor-pointer hover:shadow-xs hover:border-blue-200 transition-all duration-150 group select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Headphones size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">
              Butuh bantuan?
            </div>
            <div className="text-[11px] text-blue-600 font-medium group-hover:underline mt-0.5 flex items-center gap-1">
              <span>Tim support siap membantu</span>
              <span className="font-bold">&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
