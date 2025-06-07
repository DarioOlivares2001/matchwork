// src/app/models/chat-message.model.ts
export interface ChatMessage {
  id?: string;
  senderId: number;
  receiverId: number;
  content: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'VIDEO_CALL';
  timestamp: string;
  seen?: boolean;
}
