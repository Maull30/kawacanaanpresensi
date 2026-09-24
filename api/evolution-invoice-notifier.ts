/**
 * Evolution API WhatsApp Notifier for Invoices (Kawacanaan Presensi)
 * Menangani pengiriman pesan WhatsApp otomatis saat tagihan/invoice lunas
 * dengan format Opsi A: Teks Rapi Terformat + Smart Link PDF interaktif.
 */

export interface SendSettledParams {
  admin: any;
  payment: any;
  school?: any;
  origin?: string;
  newExpiry?: Date | string;
}

export async function sendEvolutionWhatsAppInvoiceSettled({
  admin,
  payment,
  school,
  origin = '',
  newExpiry,
}: SendSettledParams): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  try {
    // 1. Ambil konfigurasi Evolution API dari platform_settings
    const { data: settingsRow } = await admin
      .from('platform_settings')
      .select('integrations')
      .eq('id', 1)
      .maybeSingle();

    const evoConfig = settingsRow?.integrations?.evolution_api_config;
    if (!evoConfig || !evoConfig.is_enabled) {
      console.log('[Evolution API] Pengiriman invoice dilewati: Gateway belum diaktifkan (is_enabled = false).');
      return { ok: false, skipped: true, error: 'Evolution API belum diaktifkan.' };
    }

    const serverUrl = (evoConfig.server_url || '').trim().replace(/\/+$/, '');
    const instanceName = (evoConfig.instance_name || '').trim();
    const apiKey = (evoConfig.api_key || '').trim();

    if (!serverUrl || !instanceName) {
      console.log('[Evolution API] Server URL atau Instance Name belum disetel.');
      return { ok: false, skipped: true, error: 'Server URL atau Instance Name Evolution API belum disetel.' };
    }

    // 2. Jika data sekolah belum lengkap, cari dari DB
    let targetSchool = school;
    if (!targetSchool && payment.school_id) {
      const { data: sch } = await admin
        .from('schools')
        .select('*')
        .eq('id', payment.school_id)
        .maybeSingle();
      targetSchool = sch;
    }

    // 3. Normalisasi nomor telepon tujuan PIC/Sekolah
    let rawPhone = String(
      payment.contact_phone ||
      payment.pic_phone ||
      targetSchool?.pic_phone ||
      targetSchool?.phone ||
      ''
    ).trim().replace(/[^0-9]/g, '');

    if (!rawPhone) {
      console.warn('[Evolution API] Tidak dapat mengirim invoice: Nomor WhatsApp PIC tidak ditemukan.');
      return { ok: false, skipped: true, error: 'Nomor WhatsApp PIC/Sekolah tidak ditemukan.' };
    }

    if (rawPhone.startsWith('0')) {
      rawPhone = '62' + rawPhone.slice(1);
    } else if (!rawPhone.startsWith('62')) {
      rawPhone = '62' + rawPhone;
    }

    // 4. Susun data invoice dan pesan resmi
    const invoiceNo = payment.invoice_no || `INV-${String(payment.id || '').slice(0, 8).toUpperCase()}`;
    const schoolName = payment.school_name || targetSchool?.name || 'Satuan Pendidikan';
    const npsn = payment.npsn || targetSchool?.npsn || '-';
    const picName = payment.contact_name || targetSchool?.pic_name || 'Bapak/Ibu Pendidik';
    const planName = payment.plan_name || (payment.plan_id === 'sekolah_pro' ? 'Paket Sekolah KawaCanaan Presensi' : 'Paket Guru KawaCanaan Presensi');
    const amountStr = Number(payment.total_amount || payment.amount || 0).toLocaleString('id-ID');
    const paymentMethod = payment.payment_method || 'Midtrans Payment Gateway (QRIS / VA)';
    
    const paidAtRaw = payment.paid_at || new Date().toISOString();
    const paidAtStr = new Date(paidAtRaw).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    let expiryStr = '-';
    const expiryVal = newExpiry || targetSchool?.subscription_expires_at;
    if (expiryVal) {
      expiryStr = new Date(expiryVal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    // Base origin untuk Smart Link PDF
    const cleanOrigin = origin
      ? origin.replace(/\/+$/, '')
      : (process.env.APP_URL || 'https://kawacanaan-presensi.web.app').replace(/\/+$/, '');
    const smartUrl = `${cleanOrigin}/?smart_invoice=${encodeURIComponent(invoiceNo)}`;

    // Template Pesan Opsi A: Teks Terformat Rapi + Smart Link PDF
    const message = 
`*BUKTI PEMBAYARAN RESMI (INVOICE LUNAS)*
*KAWACANAAN PRESENSI DIGITAL*
----------------------------------------
Yth. Bapak/Ibu *${picName}*
*${schoolName}* (NPSN: ${npsn})

Pembayaran langganan Anda telah *BERHASIL DITERIMA & DIVERIFIKASI (LUNAS)*.

📄 *Rincian Transaksi:*
• No. Invoice: *${invoiceNo}*
• Layanan: *${planName}*
• Total Bayar: *Rp ${amountStr}*
• Metode: *${paymentMethod}*
• Waktu Pelunasan: *${paidAtStr}*
• Masa Aktif Baru: *s/d ${expiryStr}*

🔗 *Smart Link PDF Invoice Resmi:*
${smartUrl}

_(Tautan di atas dapat langsung dibuka untuk melihat rincian bukti transaksi serta mengunduh dokumen PDF A4 resmi beresolusi tinggi)_

Terima kasih atas kerja samanya dalam memajukan digitalisasi presensi sekolah.
----------------------------------------
_Pesan otomatis dari Gateway Sistem KawaCanaan Presensi._`;

    // 5. Kirim via Evolution API endpoint sendText
    const sendUrl = `${serverUrl}/message/sendText/${instanceName}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['apikey'] = apiKey;
    }

    const response = await fetch(sendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        number: rawPhone,
        text: message,
        options: {
          delay: 1000,
          presence: 'composing',
          linkPreview: true,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`[Evolution API] Berhasil mengirim invoice lunas ${invoiceNo} ke WhatsApp ${rawPhone}`);
      await admin.from('audit_logs').insert({
        school_id: targetSchool?.id || null,
        actor_name: 'Evolution API Gateway',
        actor_role: 'SYSTEM',
        action: 'WHATSAPP_INVOICE_SETTLED_SENT',
        details: {
          invoice_no: invoiceNo,
          recipient: rawPhone,
          timestamp: new Date().toISOString(),
        },
      });
      return { ok: true };
    } else {
      const errText = await response.text().catch(() => '');
      console.warn(`[Evolution API] Gagal kirim ke ${rawPhone}: status ${response.status} - ${errText}`);
      return { ok: false, error: `Evolution API HTTP ${response.status}: ${errText}` };
    }
  } catch (err: any) {
    console.error('[Evolution API Exception]', err);
    return { ok: false, error: err.message || 'Koneksi ke Evolution API waktu habis' };
  }
}
