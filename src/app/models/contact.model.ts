// src/app/shared/chat/models/contact.model.ts
export interface Contact {
  userId:   number;    // el _id del sender
  nombre:   string;    // cargado via PerfilService
  fotoUrl?: string;    // opcional
  unread:   number;    // cantidad de mensajes nuevos
}
