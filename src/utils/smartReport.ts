import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  * Menghasilkan berkas PDF yang langsung diunduh ke folder Downloads pengguna
  * tanpa beralih ke print dialog browser.
  */
export async function exportReportToPdf(element: HTMLElement, filename = 'Laporan_Presensi.pdf'): Promise<boolean> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    // 1. Pre-fetch dan convert gambar (logo, kop surat) ke base64 dataURL agar terhindar dari pemblokiran CORS
    const imgs = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        if (img.src && !img.src.startsWith('data:')) {
          try {
            const resp = await fetch(img.src, { mode: 'cors' });
            if (resp.ok) {
              const b = await resp.blob();
              const reader = new FileReader();
              await new Promise((res) => {
                reader.onloadend = () => {
                  if (reader.result) {
                    img.src = reader.result as string;
                  }
                  res(null);
                };
                reader.readAsDataURL(b);
              });
            }
          } catch (_) {}
        }
      })
    );

    // 2. Render canvas menggunakan html2canvas dengan hook onclone
    // onclone memungkinkan manipulasi layout dokumen klon internal tanpa memodifikasi DOM asli
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false, // JANGAN PERNAH allowTaint: true agar tidak melempar SecurityError saat toDataURL
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 12000,
      onclone: (_clonedDoc, clonedEl) => {
        // Reset skala dan margin pada elemen klon agar layout A4 794px tampak sempurna
        clonedEl.style.transform = 'none';
        clonedEl.style.transformOrigin = 'top left';
        clonedEl.style.width = '794px';
        clonedEl.style.minWidth = '794px';
        clonedEl.style.maxWidth = '794px';
        clonedEl.style.margin = '0 auto';
        clonedEl.style.boxSizing = 'border-box';
        clonedEl.style.padding = '32px';
        clonedEl.style.backgroundColor = '#ffffff';

        // Bersihkan border dan bayangan web
        clonedEl.classList.remove('shadow-xl', 'shadow-sm', 'border', 'border-slate-300');

        // Pastikan parent container klon tidak memotong dokumen
        if (clonedEl.parentElement) {
          clonedEl.parentElement.style.width = 'auto';
          clonedEl.parentElement.style.height = 'auto';
          clonedEl.parentElement.style.overflow = 'visible';
          clonedEl.parentElement.style.transform = 'none';
        }

        // Pastikan tabel memenuhi lebar kertas A4
        clonedEl.querySelectorAll('.overflow-x-auto').forEach((el) => {
          (el as HTMLElement).style.overflow = 'visible';
          (el as HTMLElement).style.width = '100%';
        });
        clonedEl.querySelectorAll('table').forEach((tbl) => {
          (tbl as HTMLElement).style.width = '100%';
          (tbl as HTMLElement).style.minWidth = '100%';
        });
      },
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
    const printableWidth = pdfPageWidth - marginX * 2; // 194 mm
    const printableHeight = pdfPageHeight - marginY * 2; // 281 mm

    const renderHeight = (canvas.height * printableWidth) / canvas.width;

    if (renderHeight <= printableHeight + 15) {
      const finalHeight = Math.min(renderHeight, printableHeight);
      pdf.addImage(imgData, 'JPEG', marginX, marginY, printableWidth, finalHeight);
    } else {
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

    const blob = pdf.output('blob');
    triggerPdfDownload(blob, safeFilename);
    return true;
  } catch (err) {
    console.warn('[html2canvas PDF Export Error, trying programmatic jsPDF fallback]', err);
    try {
      const fallbackPdf = generateReportPdfProgrammatic(element);
      const blob = fallbackPdf.output('blob');
      triggerPdfDownload(blob, safeFilename);
      return true;
    } catch (fallbackErr) {
      console.error('[Fatal PDF Generation Error]', fallbackErr);
      return false;
    }
  }
}

/**
 * Fallback generator PDF programatik murni menggunakan jsPDF + jspdf-autotable.
 * Menjamin file PDF resmi tetap terunduh secara instan meskipun canvas browser diblokir.
 */
function generateReportPdfProgrammatic(element: HTMLElement): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const titleEl = element.querySelector('h1, h2, .font-serif, .font-bold');
  const docTitle = titleEl?.textContent?.trim() || 'LAPORAN REKAPITULASI PRESENSI RESMI';

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(docTitle, 105, 18, { align: 'center' });

  const tableEl = element.querySelector('table');
  if (tableEl) {
    autoTable(pdf, {
      html: tableEl,
      startY: 28,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      margin: { left: 10, right: 10 },
    });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const lines = pdf.splitTextToSize(element.innerText || '', 180);
    pdf.text(lines, 15, 28);
  }

  return pdf;
}
