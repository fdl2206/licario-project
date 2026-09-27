# Licario — Fashion Catalog & Ordering Website

Website katalog dan pemesanan online untuk **Licario**, sebuah brand fashion yang memungkinkan pengunjung melihat koleksi produk, mencari produk, memilih ukuran, memasukkan produk ke keranjang, dan melakukan checkout melalui WhatsApp admin.

Website dibuat sebagai solusi katalog digital yang responsif dan mudah digunakan oleh customer.

**Production:** https://licario.co.id

## Fitur

- **Katalog produk:** Menampilkan koleksi pakaian lengkap dengan foto, nama, harga, deskripsi, dan informasi produk.
- **Pencarian produk:** Customer dapat mencari produk berdasarkan nama atau informasi terkait.
- **Filter dan kategori:** Produk dapat dikelompokkan dan difilter berdasarkan kategori.
- **Detail produk:** Halaman detail dengan informasi produk dan beberapa foto pendukung.
- **Pilihan ukuran:** Customer dapat memilih ukuran produk, termasuk opsi ukuran custom sesuai kebutuhan.
- **Status produk:** Produk dapat ditandai sebagai tersedia atau **sold out** sehingga customer tidak dapat melakukan pemesanan terhadap produk yang sudah habis.
- **Keranjang belanja:** Customer dapat menambahkan beberapa produk, mengubah jumlah, menghapus produk, dan melihat total pesanan.
- **Checkout via WhatsApp:** Pesanan dikirim ke WhatsApp admin dengan ringkasan produk, ukuran, jumlah, dan informasi customer yang telah diformat otomatis.
- **Manajemen order:** Data pesanan dapat disimpan dan dikelola melalui backend.
- **Manajemen produk:** Data produk, harga, stok/status, ukuran, dan informasi lainnya disimpan menggunakan database.
- **Responsive design:** Tampilan menyesuaikan desktop, tablet, dan perangkat mobile.
- **Media produk:** Mendukung penggunaan beberapa gambar untuk setiap produk.
- **Animasi dan interaksi UI:** Menggunakan animasi untuk meningkatkan pengalaman pengguna tanpa mengganggu navigasi.

## Teknologi

- **Next.js 16** dengan App Router.
- **React 19** dan **TypeScript**.
- **Tailwind CSS v4** untuk styling dan responsive layout.
- **Supabase** sebagai backend sementara untuk database, authentication, dan storage.
- **Zustand** untuk state management aplikasi.
- **Framer Motion** untuk animasi dan transisi antarmuka.
- **Lucide React** untuk ikon.
- **Sonner** untuk notification/toast.
- **Midtrans Client** sebagai dependency yang disiapkan untuk kebutuhan integrasi payment gateway pada pengembangan selanjutnya.

## Arsitektur Backend

Versi production saat ini menggunakan **Supabase** sebagai backend.

Supabase digunakan untuk beberapa kebutuhan utama:

- **Products:** Menyimpan data produk dan informasi katalog.
- **Orders:** Menyimpan data pesanan.
- **Authentication:** Menangani autentikasi untuk kebutuhan sistem.
- **Storage:** Menyimpan asset/media yang digunakan website.
- **Admin data:** Menyediakan sumber data yang digunakan untuk kebutuhan pengelolaan produk dan pesanan.

> Catatan: Admin dashboard khusus untuk pengelolaan produk masih menjadi bagian dari pengembangan lanjutan. Saat ini sebagian pengelolaan data masih dilakukan melalui Supabase.

## Checkout

Sistem checkout saat ini menggunakan **WhatsApp admin** sebagai jalur konfirmasi pesanan.

Alur pemesanan:

1. Customer memilih produk.
2. Customer menentukan ukuran dan jumlah.
3. Produk dimasukkan ke keranjang.
4. Customer membuka halaman checkout.
5. Customer mengisi informasi yang diperlukan.
6. Website membuat ringkasan pesanan secara otomatis.
7. Customer diarahkan ke WhatsApp admin.
8. Admin melakukan konfirmasi pesanan secara manual.

Payment gateway seperti Midtrans belum menjadi metode pembayaran utama pada versi production saat ini.

## Menjalankan Secara Lokal

### Persyaratan

- Node.js 20+ direkomendasikan.
- npm atau package manager lain yang kompatibel.

### Install dependency

```bash
npm install

Development server
npm run dev

Kemudian buka:
http://localhost:3000

Build production
npm run build

Menjalankan production build
npm run start

Lint
npm run lint

Konfigurasi Environment

Project membutuhkan environment variables untuk koneksi ke layanan backend.

Buat file:
.env.local

Kemudian isi sesuai konfigurasi project dan Supabase.

Jangan commit .env.local, API key, service role key, atau credential lainnya ke repository.

Contoh struktur:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Gunakan credential yang sesuai dengan environment masing-masing.

Deployment

Website menggunakan Vercel sebagai platform deployment untuk aplikasi Next.js.

Repository GitHub terhubung dengan deployment sehingga perubahan pada branch deployment dapat dibuild dan dideploy oleh Vercel.

Domain production:

https://licario.co.id

Pastikan environment variables yang diperlukan sudah dikonfigurasi pada environment deployment sebelum melakukan production deployment.

Struktur Singkat
licario-project/
│
├── app/
│   ├── ...             # Routes dan halaman Next.js
│
├── components/
│   ├── ...             # Komponen UI dan fitur aplikasi
│
├── lib/
│   ├── ...             # Utility dan konfigurasi
│
├── public/
│   ├── ...             # Asset statis
│
├── store/
│   ├── ...             # State management
│
├── .env.local          # Environment variables (tidak di-commit)
├── next.config.ts      # Konfigurasi Next.js
├── package.json        # Dependency dan scripts
└── README.md
Roadmap / Pengembangan Selanjutnya

Beberapa pengembangan yang direncanakan untuk project Licario:

Admin dashboard khusus untuk pengelolaan produk dan pesanan.
Migrasi database dari Supabase ke Cloudflare D1.
Migrasi media storage dari Supabase Storage ke Cloudflare R2.
Optimasi dan kompresi gambar produk.
Dukungan media tambahan seperti video untuk konten/testimonial.
Integrasi payment gateway seperti Midtrans.
Pengembangan sistem manajemen stok dan order yang lebih lengkap.

Migrasi ke Cloudflare dilakukan secara bertahap dan tidak mengganggu deployment production yang sedang digunakan.

Status Project

Production Ready / Active

Website telah digunakan sebagai website katalog dan pemesanan Licario.

Infrastructure saat ini:

Next.js
   │
   ├── Vercel
   │
   └── Supabase
        ├── Database
        ├── Storage
        ├── Authentication
        └── Orders

Rencana arsitektur berikutnya:

Next.js
   │
   ├── Vercel / Cloudflare
   │
   └── Cloudflare
        ├── D1  → Database
        └── R2  → Media Storage
Lisensi

Proprietary — Licario Project.

Source code dan sistem ini dibuat khusus untuk kebutuhan project Licario dan tidak ditujukan untuk redistribusi tanpa izin.
