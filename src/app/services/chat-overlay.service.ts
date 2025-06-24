import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contact } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ChatOverlayService {
  private contact$$ = new BehaviorSubject<Contact|null>(null);
 
  contact$ = this.contact$$.asObservable();

  open(contact: Contact) {
    this.contact$$.next(contact);
  }

  close() {
    this.contact$$.next(null);
  }
}