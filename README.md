# RentalMedan — Landing Page Rental Mobil Medan

Landing page untuk iklan Meta/Google: katalog mobil (Lepas Kunci / Dengan Supir) dengan tombol WhatsApp berisi pesan otomatis.

```text
rentalmedan/
├── web/      # Astro + Tailwind v4 (situs publik, statis)
├── studio/   # Sanity Studio (CMS untuk klien)
└── PANDUAN_KLIEN.md
```

Sanity project: `34tzzvlb`, dataset `production`. Rencana lengkap ada di `../implementation_plan_medan_car_rental.md`.

## Menjalankan di lokal

```bash
cd web && npm install && npm run dev        # http://localhost:4321
cd studio && npm install && npm run dev     # http://localhost:3333
```

`web/.env` (salin dari `web/.env.example`):

| Variabel | Fungsi |
|---|---|
| `PUBLIC_SANITY_PROJECT_ID` / `PUBLIC_SANITY_DATASET` | Sumber konten. Kosong = pakai data contoh. |
| `PUBLIC_USE_MOCK_DATA` | `true` = tampilkan data contoh (mobil, pengaturan, testimoni). **Harus `false` saat produksi.** |
| `PUBLIC_SITE_URL` | Domain produksi, mis. `https://contoh.com` (untuk canonical URL). |
| `PUBLIC_GTM_ID`, `PUBLIC_CLARITY_ID` | Opsional. Script hanya dipasang bila diisi. |

Perintah di `web/`: `npm run build`, `npm test`, `npm run check:placeholders` (lihat checklist go-live).

> Hanya konten yang sudah **Publish** di Studio yang tampil di situs. Draft tidak terlihat.

## Deploy

### 1. Studio (untuk klien)

```bash
cd studio
npx sanity login          # akun yang menjadi anggota project 34tzzvlb
npm run deploy            # pilih nama host, mis. namabrand -> https://namabrand.sanity.studio
```

Undang klien: https://www.sanity.io/manage → project → **Members** → Invite (peran **Editor**).

### 2. Situs (Cloudflare Pages atau Vercel)

Hubungkan repo Git ini, lalu isi:

| Pengaturan | Nilai |
|---|---|
| Root directory | `web` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | 22.23.4 atau lebih baru (Cloudflare: variabel `NODE_VERSION`) |
| Environment variables | `PUBLIC_SANITY_PROJECT_ID=34tzzvlb`, `PUBLIC_SANITY_DATASET=production`, `PUBLIC_USE_MOCK_DATA=false`, `PUBLIC_SITE_URL`, `PUBLIC_GTM_ID`, `PUBLIC_CLARITY_ID` |

### 3. Webhook agar edit klien tayang otomatis (±45 detik)

1. Buat **Deploy Hook**: Cloudflare Pages → Settings → Builds → *Deploy hooks*; Vercel → Settings → Git → *Deploy Hooks*. Salin URL-nya.
2. Di https://www.sanity.io/manage → project `34tzzvlb` → **API** → **Webhooks** → Create:
   - URL: URL deploy hook tadi, method `POST`
   - Dataset: `production`
   - Trigger on: **Create, Update, Delete**
   - Filter: `_type in ["car", "siteSettings", "testimonial"]`
   - Jangan sertakan draft
3. Uji: ubah harga satu mobil di Studio, **Publish**, lalu tunggu build selesai.

(Nama menu dapat sedikit berbeda antar versi dashboard.)

## Checklist go-live

- [ ] Konten asli sudah dipublish di Studio: **Pengaturan Situs** (nama brand, nomor WA `628…`, alamat, syarat), mobil beserta foto dan `Deskripsi Foto`, testimoni (opsional, hanya yang asli).
- [ ] `PUBLIC_USE_MOCK_DATA=false` di hosting.
- [ ] `npm run build && npm run check:placeholders` lulus (menolak sisa data contoh dan klaim karangan Stitch).
- [ ] Tag GTM untuk event `whatsapp_click` dibuat dan dipublish (trigger: Custom Event `whatsapp_click`; variabel dataLayer: `wa_location`, `car_name`, `package_type`).
- [ ] Buka situs di HP: klik tombol WA dari beberapa tempat dan pastikan chat terbuka dengan pesan yang benar.
- [ ] Jalankan Lighthouse (mobile) dengan foto asli; target Performance ≥ 90, Accessibility ≥ 95.
- [ ] Klaim yang tampil (jam operasional, antar jemput bandara, dll.) sudah dikonfirmasi klien.

## Pemecahan masalah

| Gejala | Penyebab umum |
|---|---|
| Situs kosong (tanpa mobil) | Belum ada dokumen **Publish**, atau dataset salah. Peringatan `[sanity] No siteSettings…` muncul di log build bila Pengaturan Situs belum ada. |
| Tombol WA tidak muncul | `Pengaturan Situs` belum dipublish (nomor WA tidak ada). |
| Edit klien tidak tayang | Webhook belum dibuat/salah URL, atau dokumen masih draft. |
| Build gagal di hosting | Versi Node terlalu lama, atau `Root directory` bukan `web`. |
