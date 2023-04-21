import { Server as Socket } from 'socket.io';

export class SocketService {
  io: Socket;
  clients = {};

  constructor(socket: Socket) {
    this.io = socket;
  }

  initEvents() {
    this.io.on('connection', socket => {
      console.log('connection', socket);
    });
  }
}
