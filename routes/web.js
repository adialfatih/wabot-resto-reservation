const express = require('express');
const router = express.Router();
const { client, initWA, logoutWA, getQR, isWAReady } = require('../bot');
const qrcode = require('qrcode');
let qrImage = null;


router.get('/', (req, res) => {
  const qrCode =  getQR(); // ambil QR dari bot.js
  const isReady = isWAReady();

  res.render('index', {
    loggedIn: client?.info ? true : false,
    qrcode: !isReady ? qrCode : null,
    ready: isReady
  });
  console.log("client.info =", isReady);
});


router.post('/login', async (req, res) => {
  req.session.qr = null;
  await initWA(req);
  res.redirect('/');
});

router.post('/logout', async (req, res) => {
  await logoutWA();
  req.session.qr = null;
  res.redirect('/');
});

module.exports = router;
