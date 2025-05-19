const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const db = require('./config/db');
///const io = require('./server').io;
let client;
let qrData = null;
let isBotReady = false;



let io;
function setIO(ioInstance) {
  io = ioInstance;
}

async function initWA(req) {
  //io = setIO();
  try {

    if (client) {
      await client.destroy();
      console.log("♻️ Bot sebelumnya dimatikan");
    }
    
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: './sessions' }),
      puppeteer: { headless: true }
    });

    client.on('qr', qr => {
      //qrData =  qrcode.toDataURL(qr);
      qrcode.toDataURL(qr).then(url => {
        if (io) io.emit('qr', url);
      });
      console.log("✅ QR updated");
    });
    

    client.on('ready', () => {
      isBotReady = true;
      if (io) io.emit('ready');
      console.log('✅ WhatsApp Client is ready!');
    });


    client.on('disconnected', () => {
      isBotReady = false;
      console.log('❌ WhatsApp Bot disconnected!');
    });

    client.on('message', async (msg) => {
      require('./controllers/botController')(client, msg);
    });

    client.initialize();
  } catch (err) {
    console.error("❌ Error initWA:", err.message);
  }
}

async function logoutWA() {
  try {
    if (client) {
      console.log("🔁 Logout dimulai...");

      await client.destroy(); // stop the client
      await client.logout();  // clear session (optional, tapi aman)

      console.log("✅ Client berhasil logout.");
    }

    isBotReady = false;
  } catch (err) {
    console.error("❌ Gagal logout:", err.message || err);
  }
}

function getQR() {
  return qrData;
}
function isWAReady() {
  return isBotReady;
}

module.exports = {
  client,
  initWA,
  logoutWA,
  getQR,
  isWAReady,
  setIO
};
