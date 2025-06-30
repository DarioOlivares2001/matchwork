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
import { LucideAngularModule } from 'lucide-angular';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-angular';
import { ElementRef, ViewChild, Renderer2 } from '@angular/core';



@Component({
  selector: 'app-contacts-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  
  templateUrl: './contacts-sidebar.component.html',
  styleUrls: ['./contacts-sidebar.component.css'],
  host: {
    '[class.collapsed]': 'collapsed'
  }
})
export class ContactsSidebarComponent implements OnInit, OnDestroy {
  ChevronUpIcon = ChevronUpIcon;
  ChevronDownIcon = ChevronDownIcon;
  animateBadge = false;
  
  @Output() onSelectContact = new EventEmitter<Contact>();
  @ViewChild('badgeRef') badgeRef!: ElementRef;
  contacts: Contact[] = [];
  totalUnreadCount = 0;
  loading  = true;
  error    = '';
  collapsed = true;
  

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
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
  
    this.overlaySub = this.overlay.contact$.subscribe(contact => {
      if (!contact) return;
      this.error   = '';
      this.loading = false;
      if (!this.contacts.some(c => c.userId === contact.userId)) {
        this.contacts = [...this.contacts, contact];
        this.totalUnreadCount += contact.unread || 0;
      }
    });

 
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
          this.setupReadReceipts();    
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
    this.readSub?.unsubscribe();  
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  updateUnreadCount(newCount: number) {
    this.totalUnreadCount = newCount;

    if (this.badgeRef) {
      const el = this.badgeRef.nativeElement;
      this.renderer.removeClass(el, 'heartbeat');

      // Forzar reflow para reiniciar animación
      void el.offsetWidth;

      this.renderer.addClass(el, 'heartbeat');
    }
  }
  

  select(c: Contact) {
    this.overlay.open(c);
  }


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

 
        const unreadMap = new Map<number,number>(
          unreadList.map(u => [u._id, u.count])
        );

     
        const reqs = partners.map(id => {
          const svc$ = this.meRole === 'TRABAJADOR'
         
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
        this.totalUnreadCount = cs.reduce((sum, c) => sum + c.unread, 0);
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

 
  private setupPrivateWs() {
    this.chat.watchReadReceipts(this.meId).subscribe(frame => {
        const { by: readerId } = JSON.parse(frame.body) as { by: number };
       
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
               this.totalUnreadCount += 1;
               this.updateUnreadCount(this.totalUnreadCount);
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
               this.totalUnreadCount += 1;
               this.updateUnreadCount(this.totalUnreadCount);
            });
          }
        } else {
          
          this.contacts[idx].unread++;
          this.totalUnreadCount++;
        }
      });
  }

   private setupReadReceipts() {
  this.readSub = this.chat.watchReadReceipts(this.meId)
    .subscribe(frame => {
      try {
        const data = JSON.parse(frame.body);
        const senderId = data.senderId;
        const readerId = data.readerId;

       
         this.contacts = this.contacts.map(c => {
            if (c.userId === senderId && c.unread > 0) {
              this.totalUnreadCount -= c.unread;
              return { ...c, unread: 0 };
            }
            return c;
          });
        
        this.cdr.detectChanges();
      } catch (e) {
        console.error('Error procesando read receipt:', e);
      }
    });
}
}
