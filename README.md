# RentalMedan

Landing page rental mobil untuk pasar Medan, dirancang sebagai tujuan iklan Meta dan Google Ads. Konversi utama adalah klik tombol WhatsApp yang membawa pesan otomatis berisi unit dan paket yang dipilih pengunjung. Konten (armada, harga, nomor WhatsApp, syarat sewa, testimoni) dikelola klien lewat Sanity Studio tanpa perlu mengubah kode.

Dokumen ini ditujukan bagi developer yang akan menjalankan, memelihara, atau men-deploy proyek. Panduan untuk klien non-teknis ada di [PANDUAN_KLIEN.md](PANDUAN_KLIEN.md). Latar belakang keputusan desain dan riwayat fase pengerjaan ada di `../implementation_plan_medan_car_rental.md` (di luar repo ini).

## Daftar Isi

1. [Ringkasan](#ringkasan)
2. [Tech Stack](#tech-stack)
3. [Struktur Repositori](#struktur-repositori)
4. [Prasyarat](#prasyarat)
5. [Memulai](#memulai)
6. [Konfigurasi Environment](#konfigurasi-environment)
7. [Perintah](#perintah)
8. [Arsitektur](#arsitektur)
9. [Model Data (Sanity)](#model-data-sanity)
10. [Perilaku Katalog](#perilaku-katalog)
11. [Pelacakan dan Analitik](#pelacakan-dan-analitik)
12. [Design System](#design-system)
13. [Aksesibilitas dan Performa](#aksesibilitas-dan-performa)
14. [Pengujian dan Quality Gate](#pengujian-dan-quality-gate)
15. [Deployment](#deployment)
16. [Checklist Go-Live](#checklist-go-live)
17. [Pemecahan Masalah](#pemecahan-masalah)
18. [Batasan yang Diketahui](#batasan-yang-diketahui)

## Ringkasan

| Aspek | Keterangan |
|---|---|
| Tujuan | Menghasilkan lead WhatsApp dari trafik iklan berbayar |
| Target perangkat | Mobile-first (rancangan utama 390 px), tetap rapi di desktop |
| Rendering | Statis (SSG). Konten diambil dari Sanity saat build |
| Pembaruan konten | Klien menekan Publish di Studio, webhook memicu build ulang (sekitar 45 detik) |
| Bahasa antarmuka | Indonesia (`lang="id"`) |
| Sanity project | `34tzzvlb`, dataset `production` |

Fitur halaman:

- Hero dengan jangkar harga "Mulai Rp X/hari" yang dihitung dari data nyata.
- Katalog armada dengan filter kategori dan toggle paket Lepas Kunci / Dengan Supir. Harga, catatan, dan tautan WhatsApp berganti tanpa request tambahan.
- Penanganan unit tidak tersedia ("Sedang Disewa") dengan CTA "Tanya Jadwal Tersedia".
- Bagian layanan, syarat dan ketentuan (akordeon), testimoni (opsional), CTA penutup, dan footer.
- Tombol WhatsApp: sticky bar di mobile, tombol mengambang di desktop.
- Event `whatsapp_click` ke `dataLayer` untuk Google Tag Manager.

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Astro 7, TypeScript mode strict |
| Styling | Tailwind CSS v4 melalui `@tailwindcss/vite`; token desain di blok `@theme` pada CSS (tanpa `tailwind.config`) |
| Font | Montserrat Variable dan Inter Variable, di-host sendiri via `@fontsource-variable` |
| Ikon | `@lucide/astro` (deep import per ikon) |
| CMS | Sanity Studio 6, standalone (tidak di-embed ke situs) |
| Integrasi CMS | `@sanity/astro` (modul virtual `sanity:client`), kueri GROQ bertipe via `defineQuery` |
| Gambar | `@sanity/image-url` dengan negosiasi format otomatis (WebP/AVIF) dan `srcset` |
| Pengujian | `node --test` dengan type stripping bawaan Node untuk berkas `.ts` |

Runtime: Node.js 22.23.4 atau lebih baru (Node 24 dipakai saat pengembangan).

## Struktur Repositori

Monorepo dua paket yang berdiri sendiri (tanpa workspace manager). Masing-masing punya `package.json` dan `node_modules` sendiri.

```text
rentalmedan/
├── web/                          # Situs publik (Astro)
│   ├── public/
│   │   └── mock/                 # SVG placeholder untuk data contoh (hanya mode mock)
│   ├── scripts/
│   │   └── check-placeholders.mjs  # Gerbang go-live: menolak sisa data contoh di dist/
│   ├── src/
│   │   ├── components/           # Navbar, Hero, CarCatalog, CarCard, ServicesSection,
│   │   │                         # TermsAccordion, Testimonials, FinalCTA, Footer,
│   │   │                         # FloatingWA, WhatsAppIcon
│   │   ├── layouts/Layout.astro  # <head>, SEO/OG, GTM/Clarity, skip link, listener pelacakan
│   │   ├── lib/
│   │   │   ├── sanity.ts         # Kueri GROQ, aturan fallback mock, helper gambar
│   │   │   ├── formatters.ts     # formatIDR, buildWhatsAppUrl, getMinPrice, buildCarMessage
│   │   │   ├── formatters.test.ts
│   │   │   ├── mock.ts           # Data contoh (6 mobil, pengaturan, 3 testimoni)
│   │   │   └── types.ts
│   │   ├── pages/index.astro     # Komposisi halaman tunggal
│   │   └── styles/global.css     # Tailwind, font, token @theme, base layer
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   └── .env.example
├── studio/                       # Sanity Studio
│   ├── schemaTypes/              # car, siteSettings, testimonial
│   ├── structure.ts              # Singleton Pengaturan Situs
│   ├── sanity.config.ts
│   └── sanity.cli.ts
├── PANDUAN_KLIEN.md              # Panduan satu halaman untuk klien
├── skills-lock.json              # Skill agen (sanity-best-practices)
└── README.md
```

## Prasyarat

- Node.js 22.23.4 atau lebih baru, dan npm.
- Git.
- Akun Sanity yang sudah menjadi anggota project `34tzzvlb` (untuk menjalankan Studio, deploy schema, dan deploy Studio).
- Opsional untuk pengujian visual: Google Chrome (dipakai headless oleh puppeteer atau Lighthouse; tidak menjadi dependency repo).

## Memulai

```bash
git clone git@github.com:Yorskies/Landingpage_RentalMedan.git
cd Landingpage_RentalMedan

# Situs publik
cd web
cp .env.example .env
npm install
npm run dev                      # http://localhost:4321

# Studio (terminal lain)
cd ../studio
npm install
npx sanity login                 # sekali saja, akun anggota project
npm run dev                      # http://localhost:3333
```

Untuk melihat situs tanpa mengisi Sanity, set `PUBLIC_USE_MOCK_DATA=true` di `web/.env`. Situs akan memakai data contoh bawaan (lihat [Aturan data contoh](#aturan-data-contoh-mock)).

> Hanya dokumen yang sudah di-publish di Studio yang diambil situs. Draft tidak pernah tampil.

## Konfigurasi Environment

Berkas `web/.env` (salin dari `web/.env.example`; `.env` sudah di-gitignore).

| Variabel | Wajib | Default | Fungsi |
|---|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Ya untuk data nyata | kosong | ID project Sanity. Kosong berarti seluruh pengambilan data dilewati dan situs memakai data contoh. |
| `PUBLIC_SANITY_DATASET` | Tidak | `production` | Dataset Sanity. |
| `PUBLIC_USE_MOCK_DATA` | Tidak | `false` | `true` memaksa data contoh. Harus `false` di produksi. |
| `PUBLIC_SITE_URL` | Disarankan di produksi | kosong | Domain produksi, mis. `https://namabrand.com`. Dipakai untuk canonical URL. |
| `PUBLIC_GTM_ID` | Tidak | kosong | ID container GTM (`GTM-XXXXXXX`). Skrip hanya dipasang bila diisi. |
| `PUBLIC_CLARITY_ID` | Tidak | kosong | ID proyek Microsoft Clarity. Skrip hanya dipasang bila diisi. |

Catatan teknis: `astro.config.mjs` berjalan sebelum Astro memuat `.env`, sehingga variabel `PUBLIC_*` dibaca lewat `loadEnv` dari Vite. Integrasi `@sanity/astro` melempar error jika `projectId` kosong, karena itu konfigurasi memakai nilai pengganti `'unconfigured'` dan `src/lib/sanity.ts` melewati semua fetch saat variabel kosong.

Semua variabel `PUBLIC_*` tertanam di HTML hasil build. Jangan menaruh rahasia di dalamnya.

## Perintah

Di direktori `web/`:

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server di `http://localhost:4321` |
| `npm run build` | Build statis ke `dist/` |
| `npm run preview` | Menyajikan `dist/` secara lokal |
| `npm test` | Unit test helper format dan pesan WhatsApp |
| `npm run check:placeholders` | Gagal (exit 1) bila `dist/` masih memuat data contoh atau klaim karangan dari draf desain |
| `npx astro check` | Pemeriksaan tipe TypeScript dan Astro |

Di direktori `studio/`:

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Studio lokal di `http://localhost:3333` |
| `npm run build` | Build Studio |
| `npm run deploy` | Deploy Studio ke `<host>.sanity.studio` |
| `npx sanity schemas deploy` | Mengunggah schema ke Sanity (agar tersedia untuk tooling) |

## Arsitektur

```text
Klien (Studio)  --Publish-->  Sanity (dataset production)
                                   |  webhook (create/update/delete)
                                   v
                          Deploy hook hosting  --build-->  astro build
                                                              |  GROQ fetch saat build
                                                              v
                                                         dist/ (HTML statis)  -->  CDN  -->  Pengunjung
```

Prinsip yang diterapkan:

- **Tanpa request data di sisi browser.** Semua konten dirender ke HTML saat build. JavaScript klien hanya mengurus interaksi katalog, menu mobile, dan pelacakan.
- **Server-rendered state, client-swapped.** Harga, catatan, dan URL WhatsApp untuk kedua paket dirender ke atribut `data-*`. Skrip klien hanya menukar nilai yang sudah ada.
- **Tanpa JavaScript, halaman tetap terbaca.** Akordeon memakai `<details>` native; konten dan tautan WhatsApp tetap berfungsi.
- **Pemisahan kueri dan tampilan.** Seluruh akses data lewat `src/lib/sanity.ts`; komponen hanya menerima objek bertipe `Car`, `SiteSettings`, `Testimonial`.

### Aturan data contoh (mock)

`src/lib/sanity.ts` memutuskan sumber data per jenis konten:

| Kondisi | Hasil |
|---|---|
| `PUBLIC_SANITY_PROJECT_ID` kosong | Data contoh |
| `PUBLIC_USE_MOCK_DATA=true` | Data contoh |
| Mode dev (`astro dev`) dan dataset kosong | Data contoh |
| Build produksi dan dataset kosong | Bagian kosong tidak dirender (tidak ada konten palsu) |
| Dataset berisi dokumen | Data Sanity |

Bila `siteSettings` tidak ditemukan dan mock mati, build mencetak peringatan `[sanity] No siteSettings document found`, dan tombol WhatsApp tidak muncul karena tidak ada nomor.

## Model Data (Sanity)

Schema ada di `studio/schemaTypes/`. Label Studio berbahasa Indonesia dan sengaja identik dengan yang dipakai di [PANDUAN_KLIEN.md](PANDUAN_KLIEN.md).

### `car` (Armada Mobil)

| Field | Tipe | Aturan |
|---|---|---|
| `name` | string | Wajib |
| `slug` | slug | Dibentuk dari `name` |
| `category` | string (daftar) | City Car, MPV Keluarga, SUV Premium, Minibus; dipakai untuk filter katalog |
| `image` | image | Wajib; rasio 4:3 mendatar, lebar minimal 1200 px disarankan |
| `imageAlt` | string | Wajib; teks alternatif gambar |
| `isAvailable` | boolean | Default `true`; `false` menampilkan label "Sedang Disewa" |
| `isFeatured` | boolean | Default `false`; menampilkan badge "Favorit" |
| `priceSelfDrive` | number | Harga Lepas Kunci per hari |
| `priceWithDriver` | number | Harga Dengan Supir per hari |
| `transmission` | string (daftar) | Automatic (AT), Manual (MT), AT / MT |
| `fuelType` | string (daftar) | Bensin, Diesel, Hybrid |
| `seats` | number | Wajib, minimal 1 |
| `driverNote`, `selfDriveNote` | string | Catatan per paket |
| `orderRank` | number | Angka kecil tampil lebih dulu |

Validasi khusus: minimal satu dari `priceSelfDrive` atau `priceWithDriver` harus terisi (helper `needsOnePrice`). Unit dengan satu paket saja tampil tanpa toggle dan mempertahankan paket satu-satunya itu.

### `siteSettings` (Pengaturan Situs, singleton)

Dokumen tunggal dengan ID tetap `siteSettings`. `structure.ts` membuka dokumen tersebut langsung dari menu dan menyembunyikan tipe ini dari daftar dokumen. Schema sendiri tidak membatasi pembuatan dokumen kedua, tetapi situs hanya membaca satu (`*[_type == "siteSettings"][0]`).

| Field | Tipe | Aturan |
|---|---|---|
| `brandName` | string | Wajib |
| `whatsappNumber` | string | Regex `^62\d{8,13}$`, tanpa `+`, spasi, atau 0 di depan |
| `officeAddress` | text | |
| `operatingHours` | string | |
| `keyTermsHighlights` | array of string | Maksimal 4 butir |
| `termsSelfDrive`, `termsWithDriver`, `cancellationPolicy` | array of string | Syarat Lepas Kunci, Ketentuan Dengan Supir, Kebijakan Pembatalan dan Deposit; satu butir per baris |

### `testimonial` (Testimoni)

| Field | Tipe | Aturan |
|---|---|---|
| `name` | string | Wajib |
| `role` | string | Profesi atau asal kota |
| `quote` | text | Wajib, maksimal 280 karakter |
| `rating` | number | Wajib, bilangan bulat 1 sampai 5 |
| `orderRank` | number | Default 10 |

Bagian Testimoni hanya muncul bila ada minimal satu dokumen. Testimoni contoh ditandai `isSample` dan diberi label "Contoh" di halaman.

### Kueri GROQ

Didefinisikan di `src/lib/sanity.ts`. Nilai default diterapkan lewat `coalesce` sehingga dokumen lama tanpa field baru tetap valid (`isAvailable` default `true`, `isFeatured` default `false`, `orderRank` default 10). Urutan mobil: `orderRank asc, _createdAt desc`.

## Perilaku Katalog

- **Toggle paket** menggunakan `aria-pressed`. Mengganti paket memperbarui harga, catatan, dan URL tombol WhatsApp pada setiap kartu secara serentak.
- **Filter kategori** menyembunyikan kartu tanpa memuat ulang data.
- **Unit hanya satu paket:** tidak menampilkan harga paket yang tidak ada dan tidak memaksa paket yang kosong.
- **Unit tidak tersedia:** label "Sedang Disewa", gambar diredam, CTA berubah menjadi "Tanya Jadwal Tersedia", dan pesan WhatsApp menanyakan kapan unit kembali.

### Format pesan WhatsApp

Dibangun oleh `buildCarMessage` dan `buildWhatsAppUrl` (`src/lib/formatters.ts`). Contoh untuk unit tersedia:

```text
Halo Admin, saya melihat dari website. Apakah unit Toyota Avanza (Paket Lepas Kunci - Rp 350.000/hari) tersedia untuk disewa?
```

URL berbentuk `https://wa.me/<nomor>?text=<pesan ter-encode>`. Nomor harus berformat `62xxxxxxxxxx`.

## Pelacakan dan Analitik

Satu listener klik terdelegasi di `Layout.astro` menangkap setiap elemen beratribut `data-wa-track` dan mendorong event ke `dataLayer`:

```js
{
  event: 'whatsapp_click',
  wa_location: '<lokasi tombol>',   // navbar, hero, catalog_card, empty_state, service_<kno|toba|korporat>, final_cta, sticky_bar, floating_button
  car_name: '<nama mobil>' | 'general',
  package_type: 'lepas_kunci' | 'dengan_supir' | 'general'
}
```

Tidak ada pelacakan per tombol; komponen baru cukup menambahkan `data-wa-track` dan `data-wa-location`.

Konfigurasi GTM (dikerjakan di dashboard GTM, bukan di repo):

1. Variabel Data Layer: `wa_location`, `car_name`, `package_type`.
2. Trigger: Custom Event dengan nama `whatsapp_click`.
3. Tag GA4 Event dan/atau tag konversi Meta/Google Ads yang memakai trigger tersebut.
4. Publish container.

`PUBLIC_GTM_ID` dan `PUBLIC_CLARITY_ID` bersifat opsional; tanpa nilai, tidak ada skrip pihak ketiga yang dimuat.

## Design System

Token berada di blok `@theme` pada `web/src/styles/global.css`. Tema gelap dengan aksen merah dan CTA WhatsApp hijau.

| Token | Nilai | Catatan |
|---|---|---|
| `ground` | `#0d0d0d` | Latar halaman |
| `card` / `elevated` | `#18181b` / `#212124` | Permukaan |
| `line` | `#27272a` | Garis dan batas |
| `accent` | `#dc2626` | Aksen; hover dan active punya token sendiri |
| `accent-text` | `#f87171` | Aksen untuk teks kecil (kontras) |
| `wa` / `wa-hover` | `#15803d` / `#166534` | Isi tombol WhatsApp |
| `wa-text` | `#4ade80` | Teks hijau di atas latar gelap |
| `muted` / `subtle` | `#a1a1aa` / `#71717a` | Teks sekunder |

Keputusan kontras yang dihitung, bukan perkiraan:

- Putih di atas `#16A34A` hanya 3,3:1, sehingga isi tombol memakai `#15803D` (5,0:1).
- `#DC2626` untuk teks kecil hanya 4,0:1, sehingga teks kecil beraksen memakai `#F87171`.

Penyimpangan sengaja dari draf Stitch:

- CTA WhatsApp berlabel "Tanya via WhatsApp" dan berwarna hijau (bukan merah).
- Tidak ada tab bar bawah di mobile; digantikan sticky bar WhatsApp.
- Jangkar harga hero dihitung dari data ("Mulai Rp X/hari").
- Klaim yang tidak punya dasar (jumlah unit, rating, nama PT, nomor telepon di draf) dibuang dan dijaga oleh `check:placeholders`.

## Aksesibilitas dan Performa

Aksesibilitas yang diterapkan: skip link, `aria-pressed` pada toggle, `<details>` native untuk akordeon, area sentuh minimal 44 px, ring fokus yang konsisten, penghormatan pada `prefers-reduced-motion`, ukuran font minimum 12 px, dan teks alternatif gambar yang diwajibkan di schema.

Hasil Lighthouse (mobile, build produksi dengan data contoh):

| Kategori | Skor |
|---|---|
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

LCP 0,8 detik, CLS 0,029, TBT 110 ms. Catatan penting: angka ini diukur dengan gambar SVG placeholder yang sangat kecil. Hasil dengan foto asli akan berbeda dan wajib diukur ulang sebelum go-live.

Praktik performa: font di-host sendiri, ikon di-import per berkas, gambar Sanity dilayani dengan `auto('format')`, `fit('max')` (tanpa upscaling), dan `srcset` responsif; tidak ada fetch data di browser.

## Pengujian dan Quality Gate

| Pemeriksaan | Perintah | Cakupan |
|---|---|---|
| Unit test | `npm test` | `formatIDR`, `buildWhatsAppUrl`, `getMinPrice`, `buildCarMessage` (4 test) |
| Tipe | `npx astro check` | Seluruh `src/` dan `astro.config.mjs` |
| Gerbang placeholder | `npm run build && npm run check:placeholders` | Memindai `dist/**/*.html` |

`check:placeholders` menolak string berikut: `12 Unit`, `4.9/5`, `8116543210`, `81234567890`, `PT Medan Drive VIP` (karangan draf Stitch), serta `6280000000000`, `(contoh)`, `(Contoh)`, `FOTO CONTOH`, `Pelanggan Contoh`, `/mock/` (penanda data contoh). Skrip ini diuji dua arah: build mode mock harus gagal, build tanpa mock dengan data nyata harus lulus. Jadikan langkah wajib di CI atau build command produksi bila memungkinkan.

Verifikasi manual yang sudah dilakukan di Chrome headless: tanpa overflow horizontal di 390 px dan 1440 px, tanpa error konsol, toggle dan filter berfungsi, kasus satu paket dan unit tidak tersedia benar, serta 15 dari 15 CTA mengirim event `whatsapp_click`.

## Deployment

### 1. Sanity Studio (untuk klien)

```bash
cd studio
npx sanity login
npm run deploy        # pilih hostname, mis. namabrand -> https://namabrand.sanity.studio
```

Undang klien melalui https://www.sanity.io/manage, pilih project, buka Members, lalu Invite dengan peran Editor.

### 2. Situs (Cloudflare Pages atau Vercel)

Hubungkan repositori ini, lalu atur:

| Pengaturan | Nilai |
|---|---|
| Root directory | `web` |
| Build command | `npm run build` (disarankan `npm run build && npm run check:placeholders`) |
| Output directory | `dist` |
| Node | 22.23.4 atau lebih baru (Cloudflare: variabel `NODE_VERSION`) |
| Environment variables | `PUBLIC_SANITY_PROJECT_ID=34tzzvlb`, `PUBLIC_SANITY_DATASET=production`, `PUBLIC_USE_MOCK_DATA=false`, `PUBLIC_SITE_URL`, `PUBLIC_GTM_ID`, `PUBLIC_CLARITY_ID` |

### 3. Webhook agar publish klien tayang otomatis

1. Buat Deploy Hook di hosting (Cloudflare Pages: Settings, Builds, Deploy hooks; Vercel: Settings, Git, Deploy Hooks) dan salin URL-nya.
2. Di https://www.sanity.io/manage, project `34tzzvlb`, menu API, Webhooks, buat webhook baru:
   - URL: URL deploy hook, method `POST`
   - Dataset: `production`
   - Trigger on: Create, Update, Delete
   - Filter: `_type in ["car", "siteSettings", "testimonial"]`
   - Draft tidak disertakan
3. Uji: ubah harga satu mobil, Publish, tunggu build selesai, lalu periksa situs.

Nama menu pada dashboard Sanity, Cloudflare, dan Vercel ditulis dari dokumentasi umum dan dapat berbeda antar versi. Sesuaikan dengan tampilan sebenarnya.

## Checklist Go-Live

- [ ] Konten asli sudah di-publish di Studio: Pengaturan Situs (nama brand, nomor WhatsApp `628...`, alamat, jam operasional, syarat), seluruh mobil beserta foto dan Deskripsi Foto, testimoni (hanya yang asli, opsional).
- [ ] `PUBLIC_USE_MOCK_DATA=false` di hosting.
- [ ] `PUBLIC_SITE_URL` berisi domain produksi.
- [ ] `npm run build && npm run check:placeholders` lulus.
- [ ] Tag GTM untuk event `whatsapp_click` dibuat dan di-publish; ID GTM dan Clarity terisi.
- [ ] Webhook Sanity berfungsi (uji ubah-publish-tayang).
- [ ] Buka situs di HP sungguhan; klik tombol WhatsApp dari beberapa lokasi dan pastikan chat terbuka dengan pesan yang benar.
- [ ] Lighthouse mobile dijalankan dengan foto asli; target Performance 90 ke atas, Accessibility 95 ke atas.
- [ ] Klaim yang tampil (jam operasional, antar jemput bandara, dan sejenisnya) sudah dikonfirmasi klien.
- [ ] Keputusan terbuka diselesaikan: nama brand dan nama badan hukum, status testimoni (asli atau tidak), unit mana yang hanya dengan supir.

## Pemecahan Masalah

| Gejala | Penyebab umum | Tindakan |
|---|---|---|
| Situs kosong, tanpa mobil | Belum ada dokumen yang di-publish, atau dataset salah | Periksa dokumen di Studio dan `PUBLIC_SANITY_DATASET` |
| Tombol WhatsApp tidak muncul | Dokumen Pengaturan Situs belum di-publish | Buat dan publish Pengaturan Situs; cari peringatan `[sanity] No siteSettings` di log build |
| Edit klien tidak tayang | Webhook belum dibuat atau salah URL; dokumen masih draft | Periksa log pengiriman webhook di dashboard Sanity |
| Build gagal di hosting | Versi Node lama, atau Root directory bukan `web` | Atur `NODE_VERSION` dan Root directory |
| `check:placeholders` gagal | Mode mock masih aktif atau dataset kosong | Set `PUBLIC_USE_MOCK_DATA=false` dan isi Studio; baca daftar temuan di output |
| `astro dev` menampilkan data contoh padahal Sanity sudah terisi | Dokumen masih draft | Publish dokumen |
| Error "projectId" saat build | Konfigurasi integrasi tidak membaca env | Pastikan `web/.env` ada, atau biarkan kosong untuk mode mock |
| `npx sanity` gagal dengan `ERR_UNSUPPORTED_DIR_IMPORT` | Cache npx rusak | Hapus cache npx lalu ulangi; atau pakai binary lokal di `studio/node_modules` |
| Studio meminta login berulang atau menolak project | Akun yang login bukan anggota project | `npx sanity logout`, lalu login dengan akun yang diundang |

## Batasan yang Diketahui

- Proyeksi GROQ dan helper gambar (`urlFor`, `imageSrc`, `imageSrcset`) belum diuji terhadap dokumen dan gambar Sanity sungguhan, karena dataset masih kosong saat pengembangan. Uji setelah konten pertama dipublish.
- Skor Lighthouse diukur dengan placeholder SVG; ukur ulang dengan foto asli.
- Pengujian visual hanya di Chrome. Safari iOS dan Firefox belum diperiksa. Urutan tab keyboard baru diuji sebagian, dan belum ada perbandingan piksel terhadap draf Stitch.
- Teks `isSample` dan data contoh hanya penanda; satu-satunya pagar otomatis menuju produksi adalah `check:placeholders`, yang harus benar-benar dijalankan.
- `npm audit` melaporkan temuan pada dependency transitif (`smol-toml` via `@vercel/frameworks`) yang belum ditangani.
- Satu halaman tunggal tanpa routing detail per mobil; field `slug` disiapkan tetapi belum dipakai halaman.
- Lisensi proyek: `UNLICENSED` (privat).
