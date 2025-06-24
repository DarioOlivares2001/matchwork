import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Subscription, take } from 'rxjs';

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
export class ChatWindowComponent implements OnInit, OnChanges, OnDestroy {
  @Input()  contact?: Contact;
  @Output() close    = new EventEmitter<void>();

  meId!: number;
  messages: ChatMessage[] = [];
  newMessage = '';
  minimized  = false;
  isEmpresa = false;
  meNombre: string = '';


  showVideoInvitation   = false;
  videoInvitationFrom   = 0;
  videoInvitationFromName = '';
  videoRoomName         = '';
  isInVideoCall         = false;

  private globalSubs: Subscription[] = [];
  private chatSubs:   Subscription[] = [];

  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private cdr: ChangeDetectorRef
  ) {
    this.globalSubs.push(
    this.auth.user$.pipe(take(1)).subscribe(u => {
      if (u) {
        this.meId = u.id;
        this.isEmpresa = u.rol === 'EMPRESA';
      }
    })
  );
  }

  ngOnInit() : void{

    const user = this.auth.userSnapshot;
    this.meNombre = user?.nombre || 'Yo';
    
    this.globalSubs.push(
      this.chat.watchPrivate(this.meId).subscribe(frame => {
        const m = JSON.parse(frame.body) as ChatMessage;
        if (m.type === 'VIDEO_CALL' && m.receiverId === this.meId) {
          this.videoInvitationFrom     = m.senderId;
          
          this.videoInvitationFromName = this.contact?.userId === m.senderId
            ? this.contact.nombre
            : `Usuario #${m.senderId}`;
          this.videoRoomName           = JSON.parse(m.content).roomName;
          this.showVideoInvitation     = true;
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contact'] && this.contact) {
      this.openChat();
    }
  }

  private openChat() {
   
    this.chatSubs.forEach(s => s.unsubscribe());
    this.chatSubs = [];

  
    this.minimized = false;
    this.messages  = [];

    
    this.chatSubs.push(
      this.chat.markAsSeen(this.contact!.userId, this.meId)
        .pipe(take(1))
        .subscribe(() => {
          this.chat.getHistory(this.meId, this.contact!.userId)
            .pipe(take(1))
            .subscribe(hist => {
              this.messages = hist.map(m =>
                m.senderId === this.meId ? { ...m, seen: true } : m
              );
              this.scrollBottom();
            });
        })
    );

    
    this.chatSubs.push(
      this.chat.watchReadReceipts(this.meId)
        .subscribe(frame => {
          const { by } = JSON.parse(frame.body) as { by: number };
          this.messages = this.messages.map(m =>
            m.senderId === this.meId && m.receiverId === by
              ? { ...m, seen: true }
              : m
          );
          this.cdr.detectChanges();
        })
    );

    
    this.chatSubs.push(
      this.chat.watchPrivate(this.meId).subscribe(frame => {
        const m = JSON.parse(frame.body) as ChatMessage;
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


    this.messages = [...this.messages, msg];
    this.newMessage = '';
    this.scrollBottom();
    this.cdr.detectChanges();


    this.chat.sendMessage(msg);
  }

  toggleMinimize() { this.minimized = !this.minimized; }

  onEnter(event: Event) {
    const ke = event as KeyboardEvent;
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


  startVideoCall() {
    if (!this.contact) return;
    this.isInVideoCall = true;
    const room = `MatchWork_${this.meId}_${this.contact.userId}`;
    this.videoRoomName = room;
    const m: ChatMessage = {
      senderId:   this.meId,
      receiverId: this.contact.userId,
      content:    JSON.stringify({ roomName: room }),
      type:       'VIDEO_CALL',
      timestamp:  new Date().toISOString()
    };
    this.chat.sendMessage(m);
  }

  acceptVideoCall() {
    this.showVideoInvitation = false;
    this.isInVideoCall       = true;
  }

  declineVideoCall() {
    this.showVideoInvitation = false;
  }

  onCloseClicked() {
    this.close.emit();
  }

  ngOnDestroy() {
    this.globalSubs.forEach(s => s.unsubscribe());
    this.chatSubs.forEach(s   => s.unsubscribe());
  }
}
