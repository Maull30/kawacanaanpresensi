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
 * Ekspor dokumen presensi resmi langsung ke berkas PDF A4 beresolusi tinggi.
 * Selalu mengunduh file secara langsung ke folder unduhan pengguna tanpa membuka dialog cetak browser.
 */
export async function exportReportToPdf(element: HTMLElement, filename = 'Laporan_Presensi.pdf'): Promise<boolean> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const triggerDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 850,
      imageTimeout: 8000,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const renderWidth = pdfWidth;
    const renderHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = renderHeight;
    let position = 0;

    // Halaman 1
    pdf.addImage(imgData, 'JPEG', 0, position, renderWidth, renderHeight);
    heightLeft -= pdfHeight;

    // Halaman selanjutnya jika dokumen panjang
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, renderWidth, renderHeight);
      heightLeft -= pdfHeight;
    }

    try {
      pdf.save(safeFilename);
    } catch (_) {
      const blob = pdf.output('blob');
      triggerDownload(blob, safeFilename);
    }
    return true;
  } catch (err) {
    console.error('[Export Report PDF Error - Using Clean Fallback]', err);
    try {
      // Fallback tanpa gambar external jika terjadi CORS taint
      const cleanClone = element.cloneNode(true) as HTMLElement;
      cleanClone.querySelectorAll('img').forEach((img) => img.remove());
      cleanClone.style.position = 'fixed';
      cleanClone.style.left = '-9999px';
      cleanClone.style.top = '0';
      cleanClone.style.width = '850px';
      cleanClone.style.backgroundColor = '#ffffff';
      document.body.appendChild(cleanClone);
      try {
        const fallbackCanvas = await html2canvas(cleanClone, {
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 850,
        });
        const imgData = fallbackCanvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const renderWidth = pdfWidth;
        const renderHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = renderHeight;
        let position = 0;
        pdf.addImage(imgData, 'JPEG', 0, position, renderWidth, renderHeight);
        heightLeft -= pdfHeight;
        while (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, renderWidth, renderHeight);
          heightLeft -= pdfHeight;
        }
        try {
          pdf.save(safeFilename);
        } catch (_) {
          const blob = pdf.output('blob');
          triggerDownload(blob, safeFilename);
        }
        return true;
      } finally {
        document.body.removeChild(cleanClone);
      }
    } catch (cleanErr) {
      console.error('[Clean Clone PDF Error - Using Direct Text PDF]', cleanErr);
      // Fallback pasti terunduh sebagai berkas PDF
      try {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const text = element.innerText || 'Laporan Rekapitulasi Presensi';
        const lines = pdf.splitTextToSize(text, 180);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(lines.slice(0, 70), 15, 20);
        const blob = pdf.output('blob');
        triggerDownload(blob, safeFilename);
        return true;
      } catch (lastErr) {
        console.error('[Direct PDF Fallback Failed]', lastErr);
        return false;
      }
    }
  }
}
