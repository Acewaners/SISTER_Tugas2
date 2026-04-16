# DistriCom Simulator

## Apakah ini?
Simulasi visual interaktif buat belajar 4 model komunikasi dalam sistem terdistribusi. Dibuat menggunakan HTML5 dan JavaScript, jadi tidak membutuhkan install apa-apa.

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


## Model Komunikasi Lainnya 

### 3. Publisher-Subscriber
- **Penjelasan Singkat:** Model async. Publisher mengirim pesan ke sebuah topik, Subscriber yang subscribe ke topik tersebut menerima pesan tanpa saling kenal langsung.
- **Contoh Nyata:** Kafka, MQTT, Redis Pub/Sub, sistem notifikasi
- **Alur Proses:**
  1. Publisherрегистр kirim EVENT ke Message Broker / Topic
  2. Broker/Topic menerima dan menyimpan pesan
  3. Subscriber yang tertarik (subscribed) menerima pesan dari broker
- **Sifat Model ini:**
  - Coupling : Very Loose (publisher & subscriber tidak saling kenal)
  - Skalabilitas : Tinggi
  - Throughput : Tinggi (bisa banyak publisher & subscriber)

### 4. Remote Procedure Call (RPC)
- **Penjelasan Singkat:** Client memanggil fungsi yang seolah-olah lokal, tapi sebenarnya berjalan di remote server. Stub di kedua sisi menangani serialisasi dan komunikasi.
- **Contoh Nyata:** gRPC, XML-RPC, Thrift, Apache Thrift, Windows RPC
- **Alur Proses:**
  1. Client Side Stub menerima pemanggilan fungsi
  2. Stub client kirim CALL (marshall/serialisasi parameter) ke Server Stub
  3. Server Stub proses (eksekusi fungsi di remote)
  4. Server Stub kirim CALL RESULT ke Client Stub
  5. Client Stub unmarshall/deserialize hasil
- **Sifat Model ini:**
  - Coupling : Tight (client harus ketahui interface/server)
  - Skalabilitas : Rendah-Sedang
  - Throughput : Sedang-Tinggi

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
- **Tab Perbandingan:** Membandingkan keempat model
- **Tab Log:** Catatan langkah demi langkas ketika komunikasi sedang berjalan

---

### Cara Membaca Visualisasinya 
1. **Lingkaran (Node):** Mewakili entitas, bisa Client, Server, atau Node A/B/C
2. **Garis Putus-Putus:** Koneksi antar node. Garisnya menyala jika proses sedang aktif
3. **Titik Berwarna:** Itu adalah pesan yang sedang berjalan dari satu node ke node lainnya
4. **Glow / Kilau:** Node lagi aktif memproses

---

## Warna Tiap Model
| Model             | Warna            |
| ----------------- | ---------------- |
| Request-Response  | Biru (#38bdf8)   |
| Message Passing   | Hijau (#4ade80)  |
| Publisher-Sub     | Oranye (#fb923c) |
| RPC               | Ungu (#c084fc)   |

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

## Perbandingan Model

### Perbandingan Struktur

| Aspek              | Request-Response                    | Message Passing                   | Publisher-Subscriber                        | RPC                                |
| ------------------ | ----------------------------------- | --------------------------------- | ------------------------------------------- | ---------------------------------- |
| Arsitektur         | Client-Server                       | Peer-to-peer (Ring)               | Pub/Sub + Broker                            | Client-Stub / Server-Stub          |
| Jumlah pesan/sesi  | 2 (REQ + RESP)                      | 3 hop (termasuk ACK)              | 1 publish → N deliver                       | 2 (CALL + RESULT)                  |
| Kompleksitas       | Rendah                              | Sedang                            | Sedang-Tinggi                               | Rendah-Sedang                      |
| Coupling           | Tight (client ↔ server)             | Medium (node ↔ tetangga)          | Very Loose (pub ↔ sub via broker)           | Tight (client ↔ server)            |
| Skalabilitas       | Rendah (bottleneck server)          | Sedang (load terdistribusi)       | Tinggi (banyak subcriber)                   | Rendah-Sedang                      |
| Use Case Nyata     | REST API, HTTP, Query DB            | MPI, Distributed Chat, Gossip     | Kafka, MQTT, Redis Pub/Sub, Notifikasi      | gRPC, XML-RPC, Apache Thrift       |

### Perbandingan Perilaku (saat simulasi berjalan)

| Metrik             | Request-Response                          | Message Passing                         | Publisher-Subscriber                              | RPC                                  |
| -----------------  | ----------------------------------------  | --------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| Total Pesan        | 2 × N (REQ + RESP per sesi)               | 3 × N (3 hop per sesi)                  | 1 × N publish → N subscriber terima               | 2 × N (CALL + RESULT per sesi)                                |
| Rata-rata Latency  | Delay server + 1× transmission time       | Delay × 0.6 × 3 hop ≈ 1.8× delay        | Delay broker + N × delivery (async)               | Delay server + 2× transmission time                                 |  
| Throughput         | Bergantung kemampuan server               | Bergantung jumlah hop & topologi        | Tinggi (banyak subscriber paralel)                | Sedang-Tinggi                        |
| Blocking           | Ya — client menunggu RESP                 | Tidak — pesan diteruskan async          | Tidak — subscriber terima saat ada pesan          | Ya — client menunggu RESULT                               |
| Sinkronisasi       | Sinkron                                   | Async/Event-driven                      | Async/Event-driven                                | Sinkron                              |


### Kapan Pakai Model Yang Mana?

**Request-Response** → Komunikasi **sinkron** client-server. Cocok saat client butuh jawaban segera sebelum bisa lanjut, misal: query database, fetch data API, ambil halaman web.

**Message Passing** → Sistem **terdistribusi peer-to-peer**. Cocok saat tidak ada satu server pusat, pesan harus merambat antar node, misal: blockchain gossip protocol, distributed computing dengan MPI, aplikasi chat terdistribusi.

**Publisher-Subscriber** → Sistem **event-driven & loosely coupled**. Cocok saat publisher dan subscriber tidak perlu saling kenal, misal: sistem notifikasi real-time, event streaming, IoT sensor data distribution, broadcast ke banyak consumer.

**RPC** → Pemanggilan **fungsi jarak jauh** yang terlihat seperti fungsi lokal. Cocok saat interaksi client-server berupa call procedure/function, misal: microservice communication (gRPC), remote command execution, distributed object systems.

### Validasi Hasil Simulasi

Hasil simulasi bisa diverifikasi lewat panel kanan (tab **Perbandingan**):
- **Total Pesan Req-Res** = 2 × jumlah pesan (REQ + RESP per sesi)
- **Total Pesan Msg-Pass** = 3 × jumlah sesi (setiap sesi = 1 pesan yang merambat 3 hop)
- **Latency** dihitung dari rata-rata waktu proses per sesi

Dengan 2 model lainnya 
- **Total Pesan Pub-Sub** = 1 × N publish → didistribusikan ke N subscriber
- **Total Pesan RPC** = 2 × jumlah pesan (CALL + RESULT per sesi)

---

## Teknologi yang Dipakai
- HTML5 Canvas API (bawaan browser, tidak perlu install)
- JavaScript biasa (ES6+)
- CSS3 dengan CSS Variables

## Link Repository GitHub
https://github.com/Acewaners/SISTER_Tugas2