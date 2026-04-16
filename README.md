# DistriCom Simulator

## Apakah ini?
Simulasi visual interaktif buat belajar 2 model komunikasi dalam sistem terdistribusi. Dibuat menggunakan HTML 5 dan JAvaScript, jadi tidak membutuhkan install apa-apa.

--- 
## Cara Menggunakan

### Opsi 1 : Langsung Klik File
Klik 2x file `index.html` lalu buka menggunakan Chrome, Firefox, atau Edge.

### Opsi 2 : Menggunakan Python (Biar bisa reload otomatis)
``` bash
cd "d:\Kuliah SMT 6\Sistem Paralel dan Terdistribusi\Tugas 2 - Simulasi Interaktif Model Komunikasi dalam SISTER"
python -m http.server 8000 --bind 127.0.0.1
```
Setelah itu buka browser ke `http://127.0.0.1.8000`

---

## Model Komunikasi yang Saya Gunakan

### 1. Request - Response
- **Penjelasan Singkat:** Model sync. CLient mengirim request ke Server lalu menunggu balasan.
- **Contoh Nyata:** REST API, HTTP
- **Alur Proses:**
  1. Client kirim REQUEST ke Server
  2. Server proses (ada jeda sebentar)
  3. Server kirim RESONSE balik ke Client

- **Sifat Model ini:**
  - Coupling : Tight (client harus kenal server)
  - Skalabilitas : Rendah
  - Throughtput : Sedang

### 2. Message Passing
- **Penjelasan Singkat:** Proses-proses mengirim pesan satu sama lain. Topologi yang digunakan adalah ring.
- **Contoh Nyata:** MPI (Message Passing Interface), aplikasi chat terdistribusi
- **Alur Proses:**
  1. Node A mengirim pesan ke Node B (hop 1)
  2. Node B meneruskan ke Node C (hop 2)
  3. Node C mengirim ke ACK (acknowledgment) dan kembali ke Node A
- **Sifat Model ini:**
  - Coupling : Medium
  - Skalabilitas : Sedang
  - Throughput : Tergantung jumlah hop

---

## Fitur yang Bisa di Ubah-Ubah

### Panel Kiri
| Kontrol            | Buat Apa?                                      |
| ------------------ | ---------------------------------------------- |
| Tab Model          | Pilih ingin melihat proses model yang mana     |
| Slider Kecepatan   | Atur kecepatan animasi (0.5 x - 3x)            |
| Slider Delay       | Atur lama proses server (200 ms - 2000ms )     |
| Input Jumlah Pesan | Mau kirim berapa pesan selama proses ( 1- 10 ) |
| Tombol Jalankan    | Mulai Simulasi                                 |
| Tombol Reset       | Hapus semua, mulai dari awal                   |

### Panel Kanan
- **Tab Metrik:** Lihat jumlah pesan terkirim, throughput, dan latency
- **Tab Perbandingan:** Membandingkan kedua model
- **Tab Log:** Catatan langkah demi langkas ketika komunikasi sedang berjalan

---

### Cara Membaca Visualisasinya 
1. **Lingkaran (Node):** Mewakili entitas, bisa Client, Server, atau Node A/B/C
2. **Garis Putus-Putus:** Koneksi antar node. Garisnya menyala jika proses sedang aktif
3. **Titik Berwarna:** Itu adalah pesan yang sedang berjalan dari satu node ke node lainnya
4. **Glow / Kilau:** Node lagi aktif memproses

---

## Warna Tiap Model
| Model            | Warna           |
| ---------------- | --------------- |
| Request-Response | Biru (#38bdf8)  |
| Message Passing  | Hijau (#4ade80) |

---

## Struktur File

```
SISTER/
  index.html       # Isi HTML-nya
  style.css        # Styling/Tampilan
  simulator.js     # Logic simulasi semua
  README.md        # File ini
  SPEC.md          # Spesifikasi proyek
```

---

## Teknologi yang Dipakai
- HTML5 Canvas API (bawaan browser, tidak perlu install)
- JavaScript biasa (ES6+)
- CSS3 dengan CSS Variables