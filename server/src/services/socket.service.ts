import { Server as Socket } from 'socket.io';
import { logger } from '@utils/logger';

export class SocketService {
  io: Socket;
  clients = {};

  constructor(socket: Socket) {
    this.io = socket;
    this.initialize();
  }

  initialize() {
    this.io.on('connection', socket => {
      socket.on('message', logger.info);
      socket.emit('foo', 'connection');
    });
  }
}
