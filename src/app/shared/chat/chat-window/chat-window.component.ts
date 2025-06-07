import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactsSidebarComponent } from '../contacts-sidebar/contacts-sidebar.component';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { VideoInviteModalComponent } from '../video-invite-modal/video-invite-modal.component';
import { JitsiOverlayComponent } from '../jitsi-overlay/jitsi-overlay.component';

@Component({
  selector: 'app-chat-window',
  imports: [
    CommonModule,
    FormsModule,
    ContactsSidebarComponent,
    MessageBubbleComponent,
    VideoInviteModalComponent,
    JitsiOverlayComponent
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent {

}
