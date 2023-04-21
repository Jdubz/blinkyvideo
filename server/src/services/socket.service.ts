import { Server as Socket } from 'socket.io';
import { logger } from '@utils/logger';

export class SocketService {
  io: Socket;
  clients = {};

  constructor(socket: Socket) {
    this.io = socket;
  }

  initEvents() {
    this.io.on('connection', socket => {
      logger.info('connection', socket);
    });

    this.io.on('hello', arg => {
      logger.info('hello', arg);
    });
  }
}
