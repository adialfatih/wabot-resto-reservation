const express = require('express');
const router = express.Router();
const client = require('../whatsappClient'); // Pastikan ini mengacu ke instance WhatsApp

// Kirim pesan ke nomor WA
router.post('/send-reminder', async (req, res) => {
  const { nomor_wa, pesan } = req.body;

  if (!nomor_wa || !pesan) {
    return res.status(400).json({ error: 'nomor_wa dan pesan wajib diisi' });
  }

  try {
    await client.sendMessage(nomor_wa, pesan);
    res.json({ success: true, message: 'Pesan terkirim' });
  } catch (error) {
    console.error("Gagal kirim reminder:", error);
    res.status(500).json({ error: 'Gagal mengirim pesan' });
  }
});

module.exports = router;
