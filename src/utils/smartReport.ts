import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface CanonicalReportParams {
  classId?: string;
  className?: string;
  date?: string;
  attendanceType?: 'DAILY' | 'SUBJECT';
  subjectId?: string | null;
  reportType?: 'Laporan Harian' | 'Laporan Mingguan' | 'Laporan Bulanan' | 'Laporan Semester' | 'Laporan Kepala Sekolah (Bulanan)' | 'Laporan Kepala Sekolah (Semester)';
  selectedWeek?: string;
  month?: string;
  year?: string;
  semester?: 'Ganjil' | 'Genap';
  academicYear?: string;
  schoolId?: string | null;
}

/**
 * Mapping nama periode ke shortcode URL canonical
 */
export function reportTypeToPeriodCode(type?: string): string {
  switch (type) {
    case 'Laporan Mingguan':
      return 'weekly';
    case 'Laporan Bulanan':
      return 'monthly';
    case 'Laporan Semester':
      return 'semester';
    case 'Laporan Kepala Sekolah (Bulanan)':
      return 'kepsek';
    case 'Laporan Kepala Sekolah (Semester)':
      return 'kepsek_semester';
    case 'Laporan Harian':
    default:
      return 'daily';
  }
}

/**
 * Mapping shortcode URL canonical ke tipe laporan resmi
 */
export function periodCodeToReportType(code?: string | null): 'Laporan Harian' | 'Laporan Mingguan' | 'Laporan Bulanan' | 'Laporan Semester' | 'Laporan Kepala Sekolah (Bulanan)' | 'Laporan Kepala Sekolah (Semester)' {
  const clean = String(code || '').toLowerCase().trim();
  if (clean === 'kepsek' || clean === 'kepsek_monthly' || clean === 'laporan kepala sekolah (bulanan)') {
    return 'Laporan Kepala Sekolah (Bulanan)';
  }
  if (clean === 'kepsek_semester' || clean === 'laporan kepala sekolah (semester)') {
    return 'Laporan Kepala Sekolah (Semester)';
  }
  if (clean === 'weekly' || clean === 'mingguan' || clean === 'laporan mingguan') {
    return 'Laporan Mingguan';
  }
  if (clean === 'monthly' || clean === 'bulanan' || clean === 'laporan bulanan') {
    return 'Laporan Bulanan';
  }
  if (clean === 'semester' || clean === 'laporan semester') {
    return 'Laporan Semester';
  }
  return 'Laporan Harian';
}

/**
 * Membangun URL Canonical Smart Link yang lengkap, akurat, dan aman dibagikan.
 * URL ini selalu memuat parameter lengkap agar penerima di WhatsApp/browser manapun
 * langsung membuka lembar dokumen presensi yang sama persis tanpa tergantung memori lokal.
 */
export function buildCanonicalReportUrl(params: CanonicalReportParams): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const path = window.location.pathname === '/' ? '' : window.location.pathname;
  const searchParams = new URLSearchParams();

  // Flag wajib dokumen presensi
  searchParams.set('report', 'attendance');

  const cleanClassId = String(params.classId || '').trim();
  if (cleanClassId && cleanClassId !== 'null' && cleanClassId !== 'undefined') {
    searchParams.set('r', cleanClassId);
  }

  const cleanClassName = String(params.className || '').trim();
  if (cleanClassName && cleanClassName !== 'null' && cleanClassName !== 'undefined') {
    searchParams.set('cn', cleanClassName);
  }

  const cleanSchoolId = String(params.schoolId || '').trim();
  if (cleanSchoolId && cleanSchoolId !== 'null' && cleanSchoolId !== 'undefined') {
    searchParams.set('sid', cleanSchoolId);
  }

  const effectiveDate = params.date || new Date().toISOString().split('T')[0];
  searchParams.set('d', effectiveDate);

  const periodCode = reportTypeToPeriodCode(params.reportType);
  if (periodCode && periodCode !== 'daily') {
    searchParams.set('p', periodCode);
  }

  if (params.attendanceType === 'SUBJECT') {
    searchParams.set('m', 'subject');
    if (params.subjectId && params.subjectId !== 'null') {
      searchParams.set('s', params.subjectId);
    }
  }

  if (params.selectedWeek && params.reportType === 'Laporan Mingguan') {
    searchParams.set('w', params.selectedWeek);
  }
  if (params.month) {
    searchParams.set('mo', params.month);
  }
  if (params.year) {
    searchParams.set('y', String(params.year));
  }
  if (params.semester) {
    searchParams.set('sem', params.semester);
  }
  if (params.academicYear) {
    searchParams.set('ay', params.academicYear);
  }

  return `${origin}${path}?${searchParams.toString()}`;
}

/**
 * Parsing URL Query Parameter menjadi objek CanonicalReportParams yang terpadu.
 * Mendukung format canonical baru (?report=attendance&r=...&d=...) maupun alias terdahulu.
 */
export function parseCanonicalReportParams(searchParams: URLSearchParams): CanonicalReportParams | null {
  const isExplicitReport = searchParams.get('report') === 'attendance' || searchParams.get('report') === 'true';
  const rawClassId = searchParams.get('r') || searchParams.get('class') || searchParams.get('classId') || '';
  const classId = (rawClassId === 'null' || rawClassId === 'undefined') ? '' : rawClassId;
  const dateParam = searchParams.get('d') || searchParams.get('date') || '';
  const periodParam = searchParams.get('p') || searchParams.get('period') || '';
  const isSubjectMode = searchParams.get('m') === 'subject' || searchParams.get('type') === 'subject';
  const rawSubjectId = searchParams.get('s') || searchParams.get('subjectId') || null;
  const subjectId = (rawSubjectId === 'null' || rawSubjectId === 'undefined') ? null : rawSubjectId;
  const rawSchoolId = searchParams.get('sid') || searchParams.get('schoolId') || searchParams.get('school_id') || null;
  const schoolId = (rawSchoolId === 'null' || rawSchoolId === 'undefined') ? null : rawSchoolId;

  // Deteksi apakah link ini merupakan Smart Link Dokumen Presensi
  const isReportLink = Boolean(
    isExplicitReport ||
    classId ||
    periodParam ||
    (dateParam && (searchParams.get('m') || searchParams.get('s') || searchParams.get('cn')))
  );

  if (!isReportLink) return null;

  const resolvedReportType = periodCodeToReportType(periodParam);
  const now = new Date();
  const defaultYear = String(now.getFullYear());
  const rawClassName = searchParams.get('cn') || searchParams.get('className') || '';
  const className = (rawClassName === 'null' || rawClassName === 'undefined') ? '' : rawClassName;

  return {
    classId: classId || '',
    className,
    schoolId,
    date: dateParam || now.toISOString().split('T')[0],
    attendanceType: isSubjectMode ? 'SUBJECT' : 'DAILY',
    subjectId,
    reportType: resolvedReportType,
    selectedWeek: searchParams.get('w') || searchParams.get('week') || 'Minggu Ke-1',
    month: searchParams.get('mo') || searchParams.get('month') || 'Juli',
    year: searchParams.get('y') || searchParams.get('year') || defaultYear,
    semester: (searchParams.get('sem') === 'Genap' || searchParams.get('semester') === 'Genap') ? 'Genap' : 'Ganjil',
    academicYear: searchParams.get('ay') || searchParams.get('academicYear') || `${defaultYear}/${Number(defaultYear) + 1}`,
  };
}

/**
 * Pemicu unduh file blob yang aman dan kompatibel dengan semua jenis browser (Desktop, Android, iOS Safari, PWA)
 */
export function triggerPdfDownload(blob: Blob, name: string): void {
  const safeName = name.endsWith('.pdf') ? name : `${name}.pdf`;
  try {
    if (typeof window !== 'undefined' && (window.navigator as any)?.msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(blob, safeName);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    a.style.opacity = '0';
    a.href = url;
    a.download = safeName;
    a.rel = 'noopener noreferrer';
    a.target = '_self';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 10000);
  } catch (e) {
    console.error('[triggerPdfDownload Error]', e);
    try {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (_) {}
  }
}

/**
 * Ekspor dokumen presensi resmi langsung ke berkas PDF A4 beresolusi tinggi.
 * Menghasilkan tata letak A4 resmi yang rapi, tajam, dan sama persis dengan tampilan aplikasi desktop
 * meskipun tombol unduh ditekan dari ponsel/HP.
 */
export async function exportReportToPdf(element: HTMLElement, filename = 'Laporan_Presensi.pdf'): Promise<boolean> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Buat wadah klon A4 standar (794px = 210mm @96dpi)
  // Diposisikan fixed pada (0,0) dengan opacity:0 & pointer-events:none
  // agar html2canvas dapat menghitung koordinat elemen secara presisi tanpa pemotongan negatif
  const sandbox = document.createElement('div');
  sandbox.id = 'smart-report-pdf-sandbox';
  sandbox.style.position = 'fixed';
  sandbox.style.left = '0';
  sandbox.style.top = '0';
  sandbox.style.width = '794px';
  sandbox.style.minWidth = '794px';
  sandbox.style.maxWidth = '794px';
  sandbox.style.zIndex = '-99999';
  sandbox.style.opacity = '0';
  sandbox.style.pointerEvents = 'none';
  sandbox.style.backgroundColor = '#ffffff';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = 'report-pdf-clone';
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.margin = '0';
  clone.style.backgroundColor = '#ffffff';
  clone.style.boxSizing = 'border-box';
  clone.style.padding = '24px 32px';
  clone.style.display = 'block';
  clone.style.visibility = 'visible';

  // Bersihkan bayangan & border kartu web agar menjadi kertas cetak resmi
  clone.classList.remove('shadow-xl', 'shadow-sm', 'shadow-xs', 'border', 'border-slate-300', 'rounded-xl');
  clone.classList.add('p-8');

  // Pastikan tabel memenuhi lebar halaman tanpa scrollbar
  clone.querySelectorAll('.overflow-x-auto').forEach((el) => {
    (el as HTMLElement).style.overflow = 'visible';
    (el as HTMLElement).style.width = '100%';
  });
  clone.querySelectorAll('table').forEach((tbl) => {
    (tbl as HTMLElement).style.width = '100%';
    (tbl as HTMLElement).style.minWidth = '100%';
  });

  // Izinkan cross-origin untuk gambar logo / kop
  clone.querySelectorAll('img').forEach((img) => {
    img.crossOrigin = 'anonymous';
  });

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    // Beri waktu sejenak agar gambar dan font siap
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 12000,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfPageWidth = 210;
    const pdfPageHeight = 297;
    const marginX = 8;
    const marginY = 8;
    const printableWidth = pdfPageWidth - (marginX * 2); // 194 mm
    const printableHeight = pdfPageHeight - (marginY * 2); // 281 mm

    const renderHeight = (canvas.height * printableWidth) / canvas.width;

    // Jika pas 1 halaman atau hanya lebih sedikit (<= 300mm), sesuaikan rasio agar menjadi 1 halaman penuh
    if (renderHeight <= printableHeight + 15) {
      const finalHeight = Math.min(renderHeight, printableHeight);
      pdf.addImage(imgData, 'JPEG', marginX, marginY, printableWidth, finalHeight);
    } else {
      // Pembagian halaman multi-halaman rapi
      let heightLeft = renderHeight;
      let positionY = marginY;

      pdf.addImage(imgData, 'JPEG', marginX, positionY, printableWidth, renderHeight);
      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        positionY -= printableHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', marginX, positionY, printableWidth, renderHeight);
        heightLeft -= printableHeight;
      }
    }

    try {
      pdf.save(safeFilename);
    } catch (_) {
      const blob = pdf.output('blob');
      triggerPdfDownload(blob, safeFilename);
    }
    return true;
  } catch (err) {
    console.warn('[Export Report PDF Error - Using Standard Direct Render]', err);
    try {
      // Fallback cadangan langsung
      const canvasFallback = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvasFallback.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const printableWidth = 194;
      const renderHeight = (canvasFallback.height * printableWidth) / canvasFallback.width;
      pdf.addImage(imgData, 'JPEG', 8, 8, printableWidth, Math.min(renderHeight, 281));
      try {
        pdf.save(safeFilename);
      } catch (_) {
        const blob = pdf.output('blob');
        triggerPdfDownload(blob, safeFilename);
      }
      return true;
    } catch (finalErr) {
      console.error('[PDF Export Fatal]', finalErr);
      return false;
    }
  } finally {
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}
