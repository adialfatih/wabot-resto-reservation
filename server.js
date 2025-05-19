const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = socketIo(server);

let botIO = null;



// Fungsi untuk inject io ke bot.js nanti
function setIO(ioInstance) {
  botIO = ioInstance;
}

module.exports = { setIO, getIO: () => botIO };

server.listen(3000, () => {
  console.log('🚀 Server berjalan di http://localhost:3000');
});