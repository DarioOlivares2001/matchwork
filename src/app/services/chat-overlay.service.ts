import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ChatOverlayService {
  private contact$$ = new BehaviorSubject<Contact|null>(null);
  /** Observable al que se suscribe el chat-window */
  contact$ = this.contact$$.asObservable();

  /** Llama esto para abrir el chat con ese contacto */
  open(contact: Contact) {
    this.contact$$.next(contact);
  }

  /** Llama esto para cerrar el chat */
  close() {
    this.contact$$.next(null);
  }
}