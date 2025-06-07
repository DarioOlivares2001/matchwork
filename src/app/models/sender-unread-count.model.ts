// src/app/models/sender-unread-count.model.ts
export interface SenderUnreadCount {
  _id: number;   // coincide con el _id que devuelve el aggregation (senderId)
  count: number;
}
