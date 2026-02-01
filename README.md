# POS Toko Langgeng Jaya

Aplikasi **Point of Sale (POS)** mobile untuk Toko Langgeng Jaya. Dibangun dengan **Expo (React Native)** dan **Expo Router**, mendukung Android, iOS, dan Web.

---

## Fitur Utama

- **Beranda** — Dashboard dengan produk populer dan ringkasan
- **Produk** — Daftar produk, pencarian, dan detail produk per cabang
- **Transaksi** — Pembuatan transaksi, checkout, pembayaran parsial & lunas, rekap
- **Checkout** — Tambah produk ke keranjang, scan barcode, pembayaran
- **Laporan** — Upload & kelola laporan dengan filter status
- **Cash Log** — Catatan kas masuk/keluar
- **Profil** — Data karyawan, upload foto profil, ganti password
- **Printer** — Cetak struk via Bluetooth (template custom)
- **Notifikasi** — Push notification (low stock, transaksi)
- **FAQ** — Pertanyaan umum

---

## Tech Stack

| Kategori        | Teknologi |
|-----------------|-----------|
| Framework       | Expo 54, React Native 0.81, React 19 |
| Routing         | Expo Router 6 |
| Styling         | NativeWind (Tailwind CSS) 4 |
| State & Data    | TanStack React Query, Context (Auth, Cart, Permission) |
| Storage         | AsyncStorage |
| HTTP            | Fetch + `lib/config.ts` (API endpoints) |
| UI/UX           | Moti, Lottie, react-native-toast-message, react-native-confetti-cannon |
| Hardware        | expo-camera (scan), react-native-bluetooth-classic (printer) |
| Notifikasi      | expo-notifications |
| Build           | EAS Build (development, preview, production) |

---

## Struktur Proyek

```
pos-mobile/
├── app/                          # Layar (Expo Router file-based)
│   ├── _layout.tsx               # Root layout, providers, Toast
│   ├── index.tsx                 # Entry: redirect welcome/login/(tabs)
│   ├── +not-found.tsx
│   ├── (tabs)/                   # Tab utama
│   │   ├── _layout.tsx           # Tab: Beranda, Products, Transaction, Profile
│   │   ├── beranda/
│   │   ├── products/
│   │   ├── transaction/
│   │   └── profile/
│   ├── welcome/                  # Onboarding
│   ├── login/
│   ├── permissions/              # Izin kamera, Bluetooth, lokasi, dll.
│   ├── checkout/                 # Keranjang, partial, success
│   ├── products/                 # Detail produk [id], search
│   ├── transactions/             # Detail [id], laporan, rekap, pembayaran, partial
│   └── profile/
│       ├── change-password/
│       ├── faqs/
│       ├── notifications/
│       └── printer/              # Template cetak struk
├── assets/
│   ├── data/                     # Data statis
│   ├── images/                   # icon, langgeng-jaya
│   └── json/
├── components/                   # Komponen UI
│   ├── checkout/                 # AddProducts, Payment, Scanner
│   ├── transactions/             # cashlog, laporan (Create, Details, Filter)
│   ├── Header, Profile, ProductCard, Badge, BottomSheets, dll.
├── context/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── PermissionContext.tsx
├── lib/
│   ├── config.ts                 # API_CONFIG (base URL, endpoints)
│   ├── apiFetch.ts
│   ├── FormatPrice.ts, TemplatePrinter.ts, TemplateStruk.ts
│   ├── PushNotifications.ts, usePrinter.ts
├── services/                     # Logika & API calls
│   ├── ChangePassword.ts, UploadProfile.ts
│   ├── FetchProducts.ts, FetchTransactions.ts, FetchLaporan.ts, FetchCashLog.ts
│   ├── PostTransactions.ts, PostLaporan.ts, PostCashLog.ts, UploadLaporan.ts
│   └── useState*.ts              # State hooks (beranda, checkout, products, dll.)
├── types/                        # TypeScript (auth, products, transactions, laporan, dll.)
├── app.json                      # Nama: Langgeng Jaya, scheme, icon, permissions
├── eas.json                      # EAS Build (dev, preview, production)
├── package.json
├── tailwind.config.js
├── global.css
└── README.md
```

---

## Persyaratan

- **Node.js** (versi yang didukung Expo 54)
- **npm** atau **yarn**
- **Expo CLI** (opsional, bisa pakai `npx expo`)
- **EAS CLI** untuk build: `npm i -g eas-cli`

---

## Instalasi

1. Clone dan masuk ke folder proyek:

   ```bash
   cd pos-mobile
   ```

2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Buat file environment (atau set di sistem/CI):

   - `EXPO_PUBLIC_API` — URL base API backend (wajib)
   - `EXPO_PUBLIC_API_SECRET` — Secret untuk API (jika dipakai di `lib/config.ts`)

   Contoh `.env` (jika pakai paket env):

   ```env
   EXPO_PUBLIC_API=https://api.example.com
   EXPO_PUBLIC_API_SECRET=your-secret
   ```

4. Jalankan development server:

   ```bash
   npx expo start
   ```

   Untuk clear cache:

   ```bash
   npx expo start -c
   ```

---

## Scripts

| Perintah              | Keterangan                |
|-----------------------|---------------------------|
| `npm start`           | Menjalankan Expo dev server |
| `npm run android`     | Jalankan di Android       |
| `npm run ios`         | Jalankan di iOS          |
| `npm run web`         | Jalankan di browser      |
| `npm run lint`        | Menjalankan ESLint       |

---

## Build (EAS)

- **Development:** development client, distribusi internal, Android APK  
- **Preview:** distribusi internal, Android APK  
- **Production:** auto increment version, Android APK  

Contoh:

```bash
eas build --profile development --platform android
eas build --profile production --platform android
```

Konfigurasi lengkap di `eas.json`.

---

## API & Konfigurasi

Backend harus menyediakan endpoint yang dipakai di `lib/config.ts`, antara lain:

- **Auth:** login karyawan, session
- **Profile:** base, upload, password
- **Karyawan:** products (list, search, details, popular), categories, transactions, laporan, cashlog

Semua request memakai **branch_name** (cabang) dan paginasi (page, limit) sesuai definisi di `lib/config.ts`.

---

## Izin Aplikasi

Aplikasi meminta izin untuk:

- **Kamera** — Scan barcode
- **Bluetooth** — Printer struk
- **Lokasi** — Untuk discovery perangkat Bluetooth (Android)
- **Galeri/Media** — Upload foto profil & laporan
- **Notifikasi** — Push notification

Alur: setelah onboarding, halaman **permissions** akan muncul jika izin belum diberikan; setelah semua izin OK, user diarahkan ke login atau beranda.

---

## Lisensi & Kontak

Proyek ini bersifat **private** (`"private": true` di `package.json`).  
Nama aplikasi: **Langgeng Jaya** — POS Mobile untuk Toko Langgeng Jaya.
