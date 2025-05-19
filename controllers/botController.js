const db = require('../config/db');
const { getSession, setSession, clearSession } = require('./sessionManager');

module.exports = async function(client, message) {
  const isi = message.body.trim();
  const nomor = message.from;

  // Simpan semua pesan masuk
  db.query(`INSERT INTO pesan_masuk (nomor_wa, isi_pesan, tanggal_jam) VALUES (?, ?, NOW())`, [nomor, isi]);

  // Cek apakah user terdaftar
  db.query(`SELECT * FROM user WHERE nomor_wa = ?`, [nomor], async (err, rows) => {
    if (err) return console.error(err);

    const userTerdaftar = rows.length > 0;

    // Proses pendaftaran
    const session = getSession(nomor);

    if (!userTerdaftar) {
      if (isi.toLowerCase() === "daftar") {
        await client.sendMessage(nomor, "Silakan masukan nama anda.");
        setSession(nomor, { step: "menunggu_nama" });
        return;
      }

      if (session?.step === "menunggu_nama") {
        db.query(`INSERT INTO user (nomor_wa, nama, tanggal_daftar) VALUES (?, ?, NOW())`, [nomor, isi]);
        await client.sendMessage(nomor, `✅ Pendaftaran berhasil. Ketik *MENU* untuk melihat menu.`);
        clearSession(nomor);
        return;
      }

      await client.sendMessage(nomor, "Silahkan daftar terlebih dahulu dengan mengetik *DAFTAR*");
      return;
    }

    // Help
    if (isi.toLowerCase() === "help") {
      await client.sendMessage(nomor, `📖 *Panduan:*
- *DAFTAR* untuk mendaftar
- *MENU* untuk melihat menu
- *PESAN #1 #2* untuk memesan`);
      return;
    }

    // Menu
    if (isi.toLowerCase() === "menu") {
      db.query(`SELECT url_gambar FROM daftar_menu`, async (err, result) => {
        if (err || result.length === 0) return client.sendMessage(nomor, "Menu belum tersedia.");
        for (const row of result) {
          await client.sendMessage(nomor, row.url_gambar);
        }
      });
      return;
    }

    // Pesan
    if (isi.toLowerCase().startsWith("pesan")) {
      const kode = isi.match(/#\d+/g)?.map(k => k.replace('#', ''));

      if (!kode || kode.length === 0) {
        return client.sendMessage(nomor, "Format salah. Gunakan: *Pesan #1 #2*");
      }

      db.query(`SELECT kode_menu FROM table_menu WHERE kode_menu IN (${kode.map(() => '?').join(',')})`, kode, async (err, validRows) => {
        const validKode = validRows.map(row => row.kode_menu);
        const invalidKode = kode.filter(k => !validKode.includes(k));

        if (invalidKode.length > 0) {
          return client.sendMessage(nomor, `❌ Kode tidak valid: ${invalidKode.map(k => '#' + k).join(', ')}`);
        }

        setSession(nomor, { step: "konfirmasi_pesanan", kode: validKode });
        client.sendMessage(nomor, "Apakah pesanan sudah sesuai?");
      });

      return;
    }

    // Konfirmasi pesanan
    if (session?.step === "konfirmasi_pesanan") {
      if (isi.toLowerCase() === "ya") {
        setSession(nomor, { step: "pilih_pengambilan" });
        client.sendMessage(nomor, "Silakan pilih: *Dine In* / *Take Away* / *Delivery*");
      } else {
        clearSession(nomor);
        client.sendMessage(nomor, 'Silahkan pesan kembali dengan mengetik *Pesan #kode*');
      }
      return;
    }

    // Pilih metode pengambilan
    if (session?.step === "pilih_pengambilan") {
      const pilihan = isi.toLowerCase();
      if (["delivery", "dine in", "take away"].includes(pilihan)) {
        setSession(nomor, { metode: pilihan });

        if (pilihan === "delivery") {
          setSession(nomor, { step: "alamat" });
          client.sendMessage(nomor, "Silakan masukkan alamat Anda.");
        } else if (pilihan === "dine in") {
          setSession(nomor, { step: "meja" });
          client.sendMessage(nomor, "Silakan masukan nomor meja.");
        } else {
          setSession(nomor, { step: "pembayaran" });
          client.sendMessage(nomor, "Silakan pilih metode pembayaran: *Cash* / *QRIS*");
        }
      } else {
        client.sendMessage(nomor, "Pilihan tidak dikenali. Ketik: *Dine In*, *Take Away*, atau *Delivery*");
      }
      return;
    }

    if (session?.step === "alamat") {
      setSession(nomor, { alamat: isi, step: "pembayaran" });
      client.sendMessage(nomor, "Silakan pilih metode pembayaran: *Cash* / *QRIS*");
      return;
    }

    if (session?.step === "meja") {
      setSession(nomor, { no_meja: isi, step: "pembayaran" });
      client.sendMessage(nomor, "Silakan pilih metode pembayaran: *Cash* / *QRIS*");
      return;
    }

    if (session?.step === "pembayaran") {
      const metode = isi.toLowerCase();
      if (!["cash", "qris"].includes(metode)) {
        client.sendMessage(nomor, "Silakan pilih metode pembayaran: *Cash* / *QRIS*");
        return;
      }

      if (metode === "qris") {
        db.query(`SELECT url_gambar FROM gambar_qris LIMIT 1`, (err, rows) => {
          if (rows.length > 0) {
            client.sendMessage(nomor, rows[0].url_gambar);
          }
        });
      }

      // Generate kode pesanan
      db.query(`SELECT COUNT(*) AS total FROM pesanan`, (err, result) => {
        const noUrut = result[0].total + 1;
        const kodePesanan = 'ORD' + noUrut.toString().padStart(3, '0');

        // Hitung total harga
        const kodeList = session.kode;
        db.query(`SELECT kode_menu, harga FROM table_menu WHERE kode_menu IN (${kodeList.map(() => '?').join(',')})`, kodeList, (err, hargaRows) => {
          const totalHarga = hargaRows.reduce((acc, row) => acc + row.harga, 0);

          // Simpan ke DB
          db.query(`INSERT INTO pesanan 
            (kode_pesanan, nomor_wa, daftar_kode_menu, total_harga, metode_pengambilan, alamat, no_meja, metode_pembayaran, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'selesai')`, [
            kodePesanan, nomor, kodeList.join(','), totalHarga, session.metode, session.alamat || null, session.no_meja || null, metode
          ]);

          client.sendMessage(nomor, `✅ Pesanan berhasil dibuat dengan kode *${kodePesanan}*. Total: Rp${totalHarga.toLocaleString()}`);
          clearSession(nomor);
        });
      });

      return;
    }
  });
};
