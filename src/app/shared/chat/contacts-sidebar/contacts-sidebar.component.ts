// src/app/shared/chat/contacts-sidebar/contacts-sidebar.component.ts
import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin, of } from 'rxjs';
import { filter, take, switchMap, map, catchError } from 'rxjs/operators';

import { AuthService, User }                       from '../../../services/auth.service';
import { ChatService }                             from '../../../services/chat.service';
import { PerfilService, PerfilProfesionalCompleto } from '../../../services/perfil.service';
import { PerfilEmpresaService }                    from '../../../services/perfil-empresa.service';
import { ChatOverlayService }                      from '../../../services/chat-overlay.service';

import { SenderUnreadCount } from '../../../models/sender-unread-count.model';
import { Contact }           from '../../../models/contact.model';
import { ChatMessage }       from '../../../models/chat-message.model';

@Component({
  selector: 'app-contacts-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts-sidebar.component.html',
  styleUrls: ['./contacts-sidebar.component.css'],
  host: {
    '[class.collapsed]': 'collapsed'
  }
})
export class ContactsSidebarComponent implements OnInit, OnDestroy {
  @Output() onSelectContact = new EventEmitter<Contact>();

  contacts: Contact[] = [];
  loading  = true;
  error    = '';
  collapsed = false;

  private meId!: number;
  private meRole!: 'TRABAJADOR'|'EMPRESA';
  private overlaySub!: Subscription;
  private loadSub!: Subscription;
  private wsSub!: Subscription;
  private readSub!: Subscription;

  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private perfilService: PerfilService,
    private perfilEmpresaService: PerfilEmpresaService,
    private overlay: ChatOverlayService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 0) Escucho adiciones manuales
    this.overlaySub = this.overlay.contact$.subscribe(contact => {
      if (!contact) return;
      this.error   = '';
      this.loading = false;
      if (!this.contacts.some(c => c.userId === contact.userId)) {
        this.contacts = [...this.contacts, contact];
      }
    });

    // 1) Espero al primer usuario válido
    this.auth.user$
      .pipe(
        filter((u): u is User => u !== null),
        take(1)
      )
      .subscribe({
        next: user => {
          this.meId   = user.id;
          this.meRole = user.rol.toUpperCase() as any;
          this.loadContacts();
          this.setupPrivateWs();
          this.setupReadReceipts();    // <— arrancamos aquí
        },
        error: () => {
          this.error   = 'Debes iniciar sesión';
          this.loading = false;
        }
      });
  }

  ngOnDestroy() {
    this.overlaySub?.unsubscribe();
    this.loadSub?.unsubscribe();
    this.wsSub?.unsubscribe();
    this.readSub?.unsubscribe();  // <— cleanup
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  select(c: Contact) {
    this.overlay.open(c);
  }

  /**
   * 2) Cargo todos los interlocutores
   */
  private loadContacts() {
    this.loading = true;

    this.loadSub = forkJoin({
      partners:   this.chat.getConversationPartners(this.meId),
      unreadList: this.chat.getUnreadBySender(this.meId).pipe(
                    catchError(() => of([] as SenderUnreadCount[]))
                  )
    }).pipe(
      switchMap(({ partners, unreadList }) => {
        if (!partners.length) {
          this.loading = false;
          return of([] as Contact[]);
        }

        // Mapa de contadores
        const unreadMap = new Map<number,number>(
          unreadList.map(u => [u._id, u.count])
        );

        // Para cada partner: elijo servicio según mi rol
        const reqs = partners.map(id => {
          const svc$ = this.meRole === 'TRABAJADOR'
            // yo soy trabajador → contacto es empresa
            ? this.perfilEmpresaService.getPerfilEmpresa(id)
                .pipe(
                  catchError(() => of({ 
                    nombreFantasia: `Empresa ${id}`, 
                    logoUrl: '/assets/images/default-company.png' 
                  } as any))
                )
                .pipe(map(e => ({
                  userId:  id,
                  nombre:  e.nombreFantasia,
                  fotoUrl: (e as any).logoUrl || '/assets/images/default-company.png',
                  unread:  unreadMap.get(id) || 0
                } as Contact)))
            // yo soy empresa → contacto es profesional
            : this.perfilService.getPerfilCompleto(id)
                .pipe(
                  catchError(() => of({
                    usuario: { nombre: `Usuario ${id}` },
                    fotoUrl: '/assets/images/default-avatar.png'
                  } as PerfilProfesionalCompleto))
                )
                .pipe(map(p => ({
                  userId:  id,
                  nombre:  p.usuario.nombre,
                  fotoUrl: p.fotoUrl || '/assets/images/default-avatar.png',
                  unread:  unreadMap.get(id) || 0
                } as Contact)));

          return svc$;
        });

        return forkJoin(reqs);
      })
    ).subscribe({
      next: cs => {
        this.contacts = cs;
        this.loading  = false;
        this.error    = '';
      },
      error: err => {
        console.error('Error cargando contactos', err);
        this.error   = 'Error cargando contactos';
        this.loading = false;
      }
    });
  }

  /**
   * 3) WebSocket para nuevos mensajes
   */
  private setupPrivateWs() {
    this.chat.watchReadReceipts(this.meId).subscribe(frame => {
        const { by: readerId } = JSON.parse(frame.body) as { by: number };
        // El “readerId” es quien leyó TU mensaje, así que restablecemos su contador
        this.contacts = this.contacts.map(c =>
          c.userId === readerId
            ? { ...c, unread: 0 }
            : c
        );
      });

    this.wsSub = this.chat.watchPrivate(this.meId)
      .subscribe(frame => {
        const m = JSON.parse(frame.body) as ChatMessage;
        if (m.receiverId !== this.meId) return;

        const idx = this.contacts.findIndex(c => c.userId === m.senderId);
        if (idx === -1) {
          // conversación nueva: pido perfil según rol
          if (this.meRole === 'TRABAJADOR') {
            this.perfilEmpresaService.getPerfilEmpresa(m.senderId).subscribe(e => {
              this.contacts = [
                ...this.contacts,
                {
                  userId:  m.senderId,
                  nombre:  e.nombreFantasia,
                  fotoUrl: (e as any).logoUrl || '/assets/images/default-company.png',
                  unread:  1
                }
              ];
            });
          } else {
            this.perfilService.getPerfilCompleto(m.senderId).subscribe(p => {
              this.contacts = [
                ...this.contacts,
                {
                  userId:  m.senderId,
                  nombre:  p.usuario.nombre,
                  fotoUrl: p.fotoUrl || '/assets/images/default-avatar.png',
                  unread:  1
                }
              ];
            });
          }
        } else {
          // sólo incremento
          this.contacts[idx].unread++;
        }
      });
  }

   private setupReadReceipts() {
    this.readSub = this.chat.watchReadReceipts(this.meId)
      .subscribe(frame => {
        const { by: readerId } = JSON.parse(frame.body) as { by: number };

        // reseteamos a 0 el contador de UNREAD para ese contacto
        this.contacts = this.contacts.map(c =>
          c.userId === readerId
            ? { ...c, unread: 0 }
            : c
        );

        // y forzamos un detect para que Angular pinte el cambio
        this.cdr.detectChanges();
      });
  }
}
