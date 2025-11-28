import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;

  constructor(private auth: AuthService) {}

  connect() {
    if (this.socket) return;
    const token = this.auth.getToken();
    this.socket = io(environment.socketUrl, { auth: { token } });
  }

  joinRoom(room: string) {
    this.socket?.emit('joinRoom', room);
  }

  sendMessage(room: string, message: string) {
    this.socket?.emit('message', { room, message });
  }

  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('message', msg => observer.next(msg));
    });
  }

  onSuspended(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('suspended', data => observer.next(data));
    });
  }

  onMessageRejected(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('message-rejected', data => observer.next(data));
    });
  }
}
