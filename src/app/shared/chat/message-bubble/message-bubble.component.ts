// src/app/shared/chat/message-bubble/message-bubble.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { ChatMessage }       from '../../../models/chat-message.model';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.css']
})
export class MessageBubbleComponent {
  @Input() message!: ChatMessage;
  @Input() isOwn = false;
}
