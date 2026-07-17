require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const connectDB = require('./src/config/db');
const registerChatSocket = require('./src/sockets/chatSocket');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });
  registerChatSocket(io);
  app.set('io', io); // lets REST controllers reach io via req.app.get('io')

  server.listen(PORT, () => {
    logger.info(`Thread Trade API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

start();
