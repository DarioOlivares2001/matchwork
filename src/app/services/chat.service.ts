// src/app/services/chat.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { SenderUnreadCount } from '../models/sender-unread-count.model';
import { ChatMessage } from '../models/chat-message.model';
import { environment } from '../../environments/environments';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API = 'https://ponkybonk.com'; // cambia al puerto de tu chat-service
  

  constructor(private http: HttpClient, private ws: RxStomp) {}

  // Historial
  getHistory(me: number, other: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.API}/api/messages/${me}/${other}`
    );
  }

  // Unread REST
  getTotalUnread(me: number): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(
      `${this.API}/messages/unread/count/${me}`
    );
  }

  getUnreadBySender(me: number): Observable<SenderUnreadCount[]> {
    return this.http.get<SenderUnreadCount[]>(
      `${this.API}/messages/unread/by-sender/${me}`
    );
  }

  markAsSeen(sender: number, receiver: number): Observable<void> {
    return this.http.put<void>(
      `${this.API}/messages/${sender}/${receiver}/seen`,
      {}
    );
  }

  // WS: suscripciones
  watchPrivate(me: number) {
    return this.ws.watch(`/topic/private.${me}`);
  }

  watchReadReceipts(me: number) {
    return this.ws.watch(`/topic/read.receipt.${me}`);
  }

  sendMessage(msg: ChatMessage) {
    this.ws.publish({
      destination: '/app/chat.sendPrivateMessage',
      body: JSON.stringify(msg),
      headers: { 'content-type': 'application/json' }
    });
  }

  getConversationPartners(me: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.API}/api/messages/conversations/${me}`);
  }

  
  
}
