-- =============================================================================
-- Migrasi SQL Kawacanaan SD: Memastikan Tabel Platform Settings Siap Digunakan
-- =============================================================================
-- Skrip ini memastikan tabel `platform_settings` dan baris default `id = 1`
-- tersedia untuk menyimpan konfigurasi Evolution API Gateway dan integrasi sistem.
--
-- Panduan Eksekusi di Supabase:
-- 1. Buka Dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih Project Anda -> Klik menu "SQL Editor" di bilah kiri
-- 3. Klik tombol "+ New query"
-- 4. Tempelkan (Paste) skrip di bawah ini, lalu klik "Run"
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  integrations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan baris konfigurasi utama id: 1 ada
INSERT INTO public.platform_settings (id, integrations)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Refresh cache schema API
NOTIFY pgrst, 'reload schema';
