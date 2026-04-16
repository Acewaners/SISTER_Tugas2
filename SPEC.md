# SPEC: Simulasi Interaktif Model Komunikasi Sistem Terdistribusi

## 1. Info Proyek

**Nama:** DistriCom Simulator
**Jenis:** Simulasi Visual Interaktif (Web-based)
**Judul:** Simulasi Interaktif Model Komunikasi Sistem Terdistribusi
**Ringkasan:** Simulasi interaktif 2 model komunikasi sistem terdistribusi (Request-Response dan Message Passing) dengan animasi visual, kontrol slider, dan perbandingan metrik sederhana.

---

## 2. Cakupan Fitur (Kriteria "Baik")

### Model Komunikasi: 2 Model
1. **Request-Response** — model sinkron client-server
2. **Message Passing** — model komunikasi antar proses dengan topologi ring

### Komponen Tiap Model
- **Request-Response:** Client + Server
- **Message Passing:** Node A, Node B, Node C (topologi ring)

### Cara Kerjanya
- Request-Response: Client kirim request → Server proses → Server kirim response
- Message Passing: Node ngirim pesan beranting ke node berikutnya sampai balik ke pengirim (3 hop)

### Visual
- Canvas 2D dengan animasi partikel bergerak
- Node digambar sebagai lingkaran plus label di tengahnya
- Garis putus-putus buat koneksi antar node

### Kontrol Interaktif
- Tab buat pilih model
- Slider kecepatan animasi (0.5x - 3x)
- Slider delay server (200ms - 2000ms)
- Input jumlah pesan (1-10)
- Tombol Jalankan
- Tombol Reset

### Perbandingan
- Tabel perbandingan kedua model
- Metrik: total pesan terkirim, throughput, latency

### Dokumentasi
- README.md: penjelasan cara mengaktifkan prose, penjelasan model, cara membaca visualisasi

---

## 3. Visual

### Warna
- Background: #0f172a
- Aksen Request-Response: #38bdf8 (biru)
- Aksen Message Passing: #4ade80 (hijau)
- Aksen umum: #fbbf24 (kuning), #f87171 (merah)

### Font
- Inter / sans-serif buat UI
- Monospace buat metrik dan log

---

## 4. Teknologi

- 3 file terpisah: HTML, CSS, JavaScript
- HTML5 Canvas API
- JavaScript biasa (Vanilla JS)
- Nggak pakai library external / framework

---

## 5. Daftar File

- `index.html` — struktur HTML
- `style.css` — styling/tampilan
- `simulator.js` — semua logic simulasi
- `README.md` — dokumentasi
- `SPEC.md` — spesifikasi ini