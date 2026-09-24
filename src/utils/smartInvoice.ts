import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Buat Smart Link URL publik untuk invoice
 */
export function getSmartInvoiceUrl(invoiceNumber: string): string {
  if (typeof window === 'undefined') return `/?smart_invoice=${invoiceNumber}`;
  const origin = window.location.origin;
  const path = window.location.pathname === '/' ? '' : window.location.pathname;
  return `${origin}${path}?smart_invoice=${encodeURIComponent(invoiceNumber)}`;
}

/**
 * Salin Smart Link Invoice ke clipboard
 */
export async function copySmartInvoiceLink(invoiceNumber: string): Promise<boolean> {
  const url = getSmartInvoiceUrl(invoiceNumber);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (_) {}

  try {
    const input = document.createElement('textarea');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Ekspor Invoice Document ke file PDF A4 resmi beresolusi tinggi
 */
export async function exportInvoiceToPdf(element: HTMLElement, filename = 'Invoice.pdf'): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 850,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Hitung perbandingan agar pas dalam 1 halaman A4
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = imgProps.width / imgProps.height;
    let renderWidth = pdfWidth;
    let renderHeight = pdfWidth / ratio;

    if (renderHeight > pdfHeight) {
      renderHeight = pdfHeight;
      renderWidth = pdfHeight * ratio;
    }

    const xOffset = (pdfWidth - renderWidth) / 2;
    const yOffset = 0;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (err) {
    console.error('[Export Invoice PDF Error]', err);
    // Fallback ke browser print jika canvas gagal
    window.print();
  }
}
