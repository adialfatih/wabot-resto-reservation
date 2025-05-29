const Fuse = require('fuse.js');
const db = require('../config/db');

async function cariMenuDenganNamaBebas(teksUser) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT kode_menu, nama_menu FROM table_menu`, (err, rows) => {
      if (err) return reject(err);

      const fuse = new Fuse(rows, {
        keys: ['nama_menu'],
        threshold: 0.4, // semakin rendah = semakin ketat
      });

      // Pisah kata per koma (contoh: "nasgor babat, es teh")
      const itemDicari = teksUser.split(',').map(t => t.trim()).filter(Boolean);
      const hasil = [];

      for (const item of itemDicari) {
        const cocok = fuse.search(item);
        if (cocok.length > 0) {
          hasil.push(cocok[0].item.kode_menu);
        }
      }

      resolve(hasil);
    });
  });
}

module.exports = { cariMenuDenganNamaBebas };
