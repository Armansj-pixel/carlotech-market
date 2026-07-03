# Carlo Tech Store

Marketplace jualan aplikasi premium (streaming, tools kreator, dll) dengan
banyak kategori dan varian durasi per produk. Pembayaran manual transfer dulu,
struktur Xendit sudah disiapkan untuk diaktifkan begitu akun verified.

## Desain
Tema glassmorphism — kartu kaca (blur + transparan) di atas background gradient
blob yang bergerak pelan, dengan animasi fade-in bertahap dan efek hover
terangkat pada kartu produk.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase

## Logo produk

Tiap produk punya kolom `image_url`. Cara paling gampang isi logo brand asli:

1. Buka [simpleicons.org](https://simpleicons.org), cari nama brand (mis. "netflix")
2. Pakai URL: `https://cdn.simpleicons.org/[nama-brand]/[kode-warna-hex-tanpa-pagar]`
   Contoh: `https://cdn.simpleicons.org/netflix/E50914`
3. Tempel URL itu ke field logo saat tambah produk di `/admin/produk`

Kalau brand-nya gak ada di Simple Icons, upload logo sendiri ke Supabase Storage
bucket `product-logos` (buat bucket baru, public) lalu pakai public URL-nya.
Kalau `image_url` kosong atau link-nya gagal dimuat, sistem otomatis
menampilkan badge inisial huruf sebagai fallback — jadi logo selalu ada
sesuatu yang tampil, gak pernah kosong/rusak.

## Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor**, jalankan seluruh isi file `supabase/schema.sql`
3. Buka **Storage**, buat bucket baru bernama `payment-proofs`, set jadi **Public bucket**
4. Buka **Project Settings > API**, catat:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (rahasia, jangan expose ke client)

## Tambah data awal

Sekarang bisa lewat UI admin, gak perlu buka Supabase manual lagi:

1. Login ke `/admin/login` pakai `ADMIN_PASSWORD`
2. Buka `/admin/produk` → tambah kategori (Streaming, Tools Kreator, dll)
3. Tambah produk → isi nama, kategori, deskripsi, dan URL logo (lihat bagian "Logo produk" di atas)
4. Klik "Varian" pada produk → tambah durasi (mis. "1 Bulan" Rp15.000, stok 10)
5. Stok bisa diedit langsung dari kolom "Stok" di situ — begitu stok 0, produk otomatis
   tertandai "habis" di katalog publik

## Environment Variables

Copy `.env.example` jadi `.env.local` untuk development, isi sesuai data Supabase di atas.
`ADMIN_PASSWORD` bebas kamu tentukan sendiri — dipakai untuk login ke `/admin/pesanan`.

## Deploy ke Vercel (drag-and-drop, tanpa GitHub)

Karena kamu tidak menjalankan `npm install` secara lokal, Vercel yang akan build:

1. Zip seluruh folder project (kecuali `node_modules` kalau ada)
2. Di Vercel dashboard → **Add New Project** → upload/drag folder
3. Sebelum deploy pertama, buka **Settings > Environment Variables**, masukkan semua variabel
   dari `.env.example` (Production, Preview, Development sekaligus)
4. Deploy. Vercel otomatis `npm install` dan build project Next.js

## Alur order (fase manual)

1. Pembeli pilih produk & durasi di katalog → checkout → isi nama & WhatsApp
2. Sistem generate kode order (`CT-XXXXXX`) dan tampilkan info rekening
3. Pembeli upload bukti transfer di halaman status pesanan (`/order/[id]`)
4. Kamu cek pesanan masuk di `/admin/pesanan`, klik **Tandai lunas**
5. Kirim akun manual via WhatsApp ke nomor pembeli
6. Klik **Tandai terkirim** di admin panel

## Mengaktifkan Xendit nanti

Struktur sudah ada di `lib/payment/xendit.ts`. Setelah akun Xendit verified:

1. Isi `XENDIT_SECRET_KEY` di environment variables
2. Set webhook di dashboard Xendit ke `https://domainmu.com/api/xendit/webhook`
   (route ini belum dibuat — beri tahu saya kalau sudah siap, saya buatkan sekaligus
   toggle pilihan pembayaran otomatis di halaman checkout)
3. Isi `XENDIT_CALLBACK_TOKEN` sesuai token webhook dari dashboard Xendit

## Yang belum ada di versi ini (langkah lanjutan)

- Auto-delivery dari `stock_items` (kolom & tabel sudah disiapkan di schema, saat ini delivery manual via WhatsApp)
- Notifikasi WhatsApp otomatis ke admin saat ada order baru
- Integrasi pembayaran Xendit aktif
- Edit nama/deskripsi/logo produk yang sudah dibuat (saat ini bisa nonaktifkan/hapus & tambah baru;
  untuk edit field lain sementara masih lewat Table Editor Supabase)
