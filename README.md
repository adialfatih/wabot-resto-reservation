# WhatsApp Bot Pemesanan Makanan Restoran

![WhatsApp Bot](https://img.shields.io/badge/WhatsApp-Bot-green) 
![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen) 
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

Sebuah WhatsApp bot untuk memudahkan pelanggan memesan makanan dari restoran secara otomatis melalui WhatsApp.

## 📌 Fitur Utama

- **Pendaftaran Pelanggan**: Sistem registrasi via WhatsApp
- **Menu Digital**: Tampilan menu dengan gambar
- **Pemesanan**: Pesan menggunakan kode menu (contoh: #1 #5)
- **Metode Pengambilan**:
  - Dine In
  - Take Away
  - Delivery (dengan input alamat)
- **Pembayaran**:
  - Cash
  - QRIS (dengan tampilan gambar QR)
- **Konfirmasi Otomatis**: Notifikasi status pesanan

## 🛠 Teknologi

| Komponen       | Teknologi                  |
|----------------|----------------------------|
| WhatsApp API   | whatsapp-web.js            |
| Backend        | Node.js                    |
| Database       | MySQL                      |
| Session        | Custom Session Manager     |
| Server         | Express.js                 |

## 🚀 Cara Install

1. **Clone Repository**
   ```bash
   git clone https://github.com/[username]/[reponame].git
   cd whatsapp-bot-resto

2. **Install Dependencies**
   ```bash
   npm install
3. 
