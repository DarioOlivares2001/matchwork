import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Subscription } from 'rxjs';

import { Contact }     from '../../../models/contact.model';
import { ChatMessage } from '../../../models/chat-message.model';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { MessageBubbleComponent }    from '../message-bubble/message-bubble.component';
import { VideoInviteModalComponent } from '../video-invite-modal/video-invite-modal.component';
import { JitsiComponent } from '../jitsi/jitsi/jitsi.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MessageBubbleComponent,
    VideoInviteModalComponent,
    JitsiComponent
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnChanges, OnDestroy {
  @Input() contact?: Contact;

  meId!: number;
  messages: ChatMessage[] = [];
  newMessage = '';
  minimized = false;

  // ---- vídeo ----
  showVideoInvitation = false;
  videoInvitationFrom = 0;
  videoInvitationFromName = '';    // ← aquí
  videoRoomName      = '';
  isInVideoCall      = false;

  private subs: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private cdr: ChangeDetectorRef
  ) {
    const u = this.auth.userSnapshot;
    if (u) this.meId = u.id;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contact'] && this.contact) {
      this.openChat();
    }
  }

  ngOnInit() {
    // siempre escucho llamadas entrantes, aunque no haya abierto ningún chat
    this.subs.push(
      this.chat.watchPrivate(this.meId).subscribe(frame => {
        const m = JSON.parse(frame.body) as ChatMessage;

        // sólo las VIDEO_CALL dirigidas a mí
        if (m.type === 'VIDEO_CALL' && m.receiverId === this.meId) {
          // si ya tengo abierto el chat con este contacto, uso su nombre
          // (si no, podrías hacer un GET al perfil o mostrar “Usuario #123”)
          this.videoInvitationFromName = this.contact?.nombre || `Usuario #${m.senderId}`;
          this.videoRoomName           = JSON.parse(m.content).roomName;
          this.showVideoInvitation     = true;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleMinimize() {
    this.minimized = !this.minimized;
  }

  private openChat() {
    // reset
    this.minimized = false;
    this.messages = [];
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [];

    // marcar vistos en back
    this.chat.markAsSeen(this.contact!.userId, this.meId).subscribe();

    // cargar historial
    this.subs.push(
      this.chat.getHistory(this.meId, this.contact!.userId)
        .subscribe(hist => {
          this.messages = hist;
          this.scrollBottom();
        })
    );

    // suscripción WS: mensajes + señal vídeo
    this.subs.push(
      this.chat.watchPrivate(this.meId).subscribe(frame => {
        const m = JSON.parse(frame.body) as ChatMessage;

       

        // → 2) Chat normal (solo del contacto actual)
        if (
          m.type === 'CHAT' &&
          m.senderId === this.contact!.userId &&
          m.receiverId === this.meId
        ) {
          this.messages = [...this.messages, m];
          this.cdr.detectChanges();
          this.scrollBottom();
        }
      })
    );
  }

  sendMessage() {
    if (!this.contact || !this.newMessage.trim()) return;

    const msg: ChatMessage = {
      senderId:   this.meId,
      receiverId: this.contact.userId,
      content:    this.newMessage.trim(),
      type:       'CHAT',
      timestamp:  new Date().toISOString()
    };

    // UI inmediata
    this.messages = [...this.messages, msg];
    this.newMessage = '';
    this.scrollBottom();
    this.cdr.detectChanges();

    // enviar al servidor
    this.chat.sendMessage(msg);
  }

  onEnter(event: Event) {
     const ke = event as KeyboardEvent;
    // si no quieres permitir SHIFT+ENTER
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.sendMessage();
    }
  }

  private scrollBottom() {
    setTimeout(() => {
      const el = document.querySelector('.messages-list');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  // ——— Vídeo ———

  /** Usuario hace click en el icono “📹” */
  startVideoCall() {
    if (!this.contact) return;
    // 1) Montamos localmente
    this.isInVideoCall = true;
    // 2) Enviamos señal al receptor
    const room = `MatchWork_${this.meId}_${this.contact.userId}`;
    this.videoRoomName = room;
    const msg: ChatMessage = {
      senderId:   this.meId,
      receiverId: this.contact.userId,
      content:    JSON.stringify({ roomName: room }),
      type:       'VIDEO_CALL',
      timestamp:  new Date().toISOString()
    };
    this.chat.sendMessage(msg);
  }

  /** Acepta invitación */
  acceptVideoCall() {
    this.showVideoInvitation = false;
    this.isInVideoCall       = true;
  }

  /** Rechaza invitación */
  declineVideoCall() {
    this.showVideoInvitation = false;
  }
}
