# 💰 FinansSmart - Dashboard Pengelola Keuangan Cerdas

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Recharts](https://img.shields.io/badge/Recharts-222222?style=for-the-badge&logo=recharts&logoColor=white)](https://recharts.org/)

**FinansSmart** adalah aplikasi dashboard manajemen keuangan modern yang dirancang untuk membantu pengguna melacak pemasukan, pengeluaran, dan anggaran secara visual dan efisien. Dibangun dengan fokus pada pengalaman pengguna (UX) yang mulus dan desain yang premium.

![Dashboard Mockup](file:///C:/Users/user/.gemini/antigravity/brain/83590324-7024-4aaf-ae61-858a464f7814/finanssmart_dashboard_mockup_1775990437327.png)

## ✨ Fitur Utama

-   **📊 Dashboard Komprehensif**: Ringkasan saldo, total pemasukan, dan pengeluaran bulan berjalan secara visual.
-   **📈 Visualisasi Data**: Tren arus kas 6 bulan terakhir menggunakan *Area Chart* dan pembagian kategori menggunakan *Pie Chart*.
-   **📑 Manajemen Transaksi**: Sistem CRUD (Create, Read, Update, Delete) transaksi yang lengkap dengan fitur pencarian dan filter kategori.
-   **🎯 Kontrol Anggaran (Budgeting)**: Tetapkan batas pengeluaran per kategori dan pantau progresnya secara real-time dengan pemberitahuan jika melebihi batas.
-   **📁 Kategori Kustom**: Kelola kategori transaksi Anda sendiri dengan ikon dan warna yang menarik.
-   **🌗 Dark/Light Mode**: Dukungan penuh untuk tema gelap dan terang demi kenyamanan mata pengguna.
-   **📱 Desain Responsif**: Antarmuka yang optimal baik untuk penggunaan di desktop maupun perangkat seluler (mobile-friendly).
-   **🔒 Sistem Autentikasi**: Halaman login dan registrasi terintegrasi (termasuk mode Demo).

## 🚀 Teknologi yang Digunakan

-   **Core**: [React.js](https://reactjs.org/) (Functional Components & Hooks)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Charting**: [Recharts](https://recharts.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Theming**: Vanilla CSS-in-JS (Dynamic Styling)

## 🛠️ Cara Menjalankan Project

### Prasyarat
- [Node.js](https://nodejs.org/) (Versi terbaru direkomendasikan)
- npm atau yarn

### Instalasi
1. Clone repository atau unduh file project.
2. Buka terminal di direktori proyek.
3. Instal dependensi:
   ```bash
   npm install
   ```

### Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan tersedia di `http://localhost:5173`.

### Build untuk Produksi
```bash
npm run build
```

## 📝 Catatan Pengembangan
Project ini dikembangkan dengan pendekatan *mobile-first* dan menggunakan state management internal React yang efisien untuk performa yang optimal.

---
Dikembangkan dengan ❤️ untuk membantu mengelola keuangan yang lebih baik.