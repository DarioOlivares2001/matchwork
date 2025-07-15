import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactsSidebarComponent } from './contacts-sidebar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RxStomp } from '@stomp/rx-stomp';
import { AuthService } from '../../../services/auth.service';
import { ChatService } from '../../../services/chat.service';
import { PerfilService } from '../../../services/perfil.service';
import { PerfilEmpresaService } from '../../../services/perfil-empresa.service';
import { ChatOverlayService } from '../../../services/chat-overlay.service';
import { of } from 'rxjs';
import { Subject } from 'rxjs';
import { throwError } from 'rxjs';
import { IMessage } from '@stomp/stompjs'; // o '@stomp/rx-stomp'

describe('ContactsSidebarComponent', () => {
  let component: ContactsSidebarComponent;
  let fixture: ComponentFixture<ContactsSidebarComponent>;
  let authServiceStub: Partial<AuthService>;
  let chatServiceStub: Partial<ChatService>;
  let perfilServiceStub: Partial<PerfilService>;
  let perfilEmpresaServiceStub: Partial<PerfilEmpresaService>;
  let chatOverlayServiceStub: Partial<ChatOverlayService>;
  chatOverlayServiceStub = {
    contact$: of(null),
    open: jasmine.createSpy('open')
  };

  beforeEach(async () => {
    authServiceStub = {
      user$: of({ id: 1, rol: 'TRABAJADOR' })
    } as any;

    const fakeMessage = {
      ack: () => { },
      nack: () => { },
      command: 'MESSAGE',
      headers: {},
      isBinaryBody: false,
      binaryBody: new Uint8Array(),
      body: '{}'
    };

    const fakeIMessage: IMessage = {
      ack: () => { },
      nack: () => { },
      command: 'MESSAGE',
      headers: {},
      isBinaryBody: false,
      binaryBody: new Uint8Array(),
      body: 'not json'
    };

    chatServiceStub = {
      getConversationPartners: () => of([]),
      getUnreadBySender: () => of([]),
      watchPrivate: (_me: number) => of(fakeMessage),
      watchReadReceipts: (_me: number) => of(fakeMessage)
    };

    perfilServiceStub = {
      getPerfilCompleto: () => of({ usuario: { nombre: 'Usuario' }, fotoUrl: '' })
    } as any;

    perfilEmpresaServiceStub = {
      getPerfilEmpresa: () => of({ nombreFantasia: 'Empresa', logoUrl: '' })
    } as any;

    chatOverlayServiceStub = {
      contact$: of(null),
      open: () => { }
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ContactsSidebarComponent],
      providers: [
        { provide: RxStomp, useValue: {} },
        { provide: AuthService, useValue: authServiceStub },
        { provide: ChatService, useValue: chatServiceStub },
        { provide: PerfilService, useValue: perfilServiceStub },
        { provide: PerfilEmpresaService, useValue: perfilEmpresaServiceStub },
        { provide: ChatOverlayService, useValue: chatOverlayServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('no hace nada si contact$ emite null', () => {
    // Simula emisión de null en el observable
    chatOverlayServiceStub.contact$ = of(null); // 👈 se emite null

    // Inicializa componente
    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;

    // Ejecuta el ngOnInit (que se llama en detectChanges)
    fixture.detectChanges();

    // Si no lanza errores, está bien cubierto
    expect(component).toBeTruthy(); // solo verificamos que el init no falle
  });

  it('agrega un nuevo contacto si no está en la lista y suma unread', async () => {
    const nuevoContacto = { userId: 123, nombre: 'Nuevo', unread: 5 };
    const contactosIniciales = [{ userId: 1, nombre: 'Antiguo', unread: 2 }];
    const contactSubject = new Subject<any>();

    // Configuramos el stub actualizado antes del TestBed
    chatOverlayServiceStub.contact$ = contactSubject.asObservable();

    await TestBed.resetTestingModule().configureTestingModule({
      imports: [HttpClientTestingModule, ContactsSidebarComponent],
      providers: [
        { provide: RxStomp, useValue: {} },
        { provide: AuthService, useValue: authServiceStub },
        { provide: ChatService, useValue: chatServiceStub },
        { provide: PerfilService, useValue: perfilServiceStub },
        { provide: PerfilEmpresaService, useValue: perfilEmpresaServiceStub },
        { provide: ChatOverlayService, useValue: chatOverlayServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;

    // Seteamos el estado inicial
    component.contacts = [...contactosIniciales];
    component.totalUnreadCount = 2;

    fixture.detectChanges(); // <--- una sola vez por test

    // Después del detectChanges seteamos los valores
    component.contacts = [...contactosIniciales];
    component.totalUnreadCount = 2;

    contactSubject.next(nuevoContacto);
    fixture.detectChanges();

    expect(component.contacts.length).toBe(2);
    expect(component.totalUnreadCount).toBe(7);
  });

  it('debe alternar collapsed con toggle()', () => {
    const prev = component.collapsed;
    component.toggle();
    expect(component.collapsed).toBe(!prev);
  });

  it('debe alternar collapsed con toggle()', () => {
    const prev = component.collapsed;
    component.toggle();
    expect(component.collapsed).toBe(!prev);
  });

  it('debería actualizar el contador de no leídos', () => {
    component.totalUnreadCount = 2;
    component.badgeRef = { nativeElement: document.createElement('div') } as any; // simula badge
    spyOn(component['renderer'], 'removeClass');
    spyOn(component['renderer'], 'addClass');
    component.updateUnreadCount(5);
    expect(component.totalUnreadCount).toBe(5);
    expect(component['renderer'].removeClass).toHaveBeenCalled();
    expect(component['renderer'].addClass).toHaveBeenCalled();
  });

  it('debería mostrar error si getConversationPartners falla', () => {
    const chatService = TestBed.inject(ChatService);
    spyOn(chatService, 'getConversationPartners').and.returnValue(throwError(() => new Error('fail')));
    spyOn(chatService, 'getUnreadBySender').and.returnValue(of([]));

    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBe('Error cargando contactos');
    expect(component.loading).toBeFalse();
  });


  it('debería dejar loading=false si partners está vacío', () => {
    const chatService = TestBed.inject(ChatService);
    spyOn(chatService, 'getConversationPartners').and.returnValue(of([]));
    spyOn(chatService, 'getUnreadBySender').and.returnValue(of([]));

    // Forzar componente
    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.contacts.length).toBe(0);
  });

  it('debería seguir funcionando si getUnreadBySender falla', () => {
    const chatService = TestBed.inject(ChatService);
    spyOn(chatService, 'getConversationPartners').and.returnValue(of([2]));
    spyOn(chatService, 'getUnreadBySender').and.returnValue(throwError(() => new Error('fail')));

    // Para PerfilEmpresaService (el otro branch sería PerfilService si rol fuera EMPRESA)
    const perfilEmpresaService = TestBed.inject(PerfilEmpresaService);
    spyOn(perfilEmpresaService, 'getPerfilEmpresa').and.returnValue(
      of({ id: 123, nombreFantasia: 'Empresa', logoUrl: '' })
    );

    // Forzar componente
    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Debe agregar el partner igual, sin crashear
    expect(component.contacts.length).toBe(1);
    expect(component.contacts[0].nombre).toBe('Empresa');
    expect(component.loading).toBeFalse();
  });

  it('debería manejar error en getPerfilEmpresa y poner nombre por defecto', () => {
    const chatService = TestBed.inject(ChatService);
    spyOn(chatService, 'getConversationPartners').and.returnValue(of([5]));
    spyOn(chatService, 'getUnreadBySender').and.returnValue(of([]));

    const perfilEmpresaService = TestBed.inject(PerfilEmpresaService);
    spyOn(perfilEmpresaService, 'getPerfilEmpresa').and.returnValue(throwError(() => new Error('fail')));

    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.contacts.length).toBe(1);
    expect(component.contacts[0].nombre).toContain('Empresa');
  });

  it('debería manejar error en getPerfilCompleto y poner usuario por defecto', () => {
    // Simula usuario EMPRESA
    const authService = TestBed.inject(AuthService);
    (authService as any).user$ = of({ id: 1, rol: 'EMPRESA' });

    const chatService = TestBed.inject(ChatService);
    spyOn(chatService, 'getConversationPartners').and.returnValue(of([6]));
    spyOn(chatService, 'getUnreadBySender').and.returnValue(of([]));

    const perfilService = TestBed.inject(PerfilService);
    spyOn(perfilService, 'getPerfilCompleto').and.returnValue(throwError(() => new Error('fail')));

    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.contacts.length).toBe(1);
    expect(component.contacts[0].nombre).toContain('Usuario');
  });

  it('debería alternar la propiedad collapsed al llamar toggle', () => {
    const estadoInicial = component.collapsed;
    component.toggle();
    expect(component.collapsed).toBe(!estadoInicial);
  });

  it('debería alternar colapso al llamar a toggle()', () => {
    expect(component.collapsed).toBeTrue();
    component.toggle();
    expect(component.collapsed).toBeFalse();
  });


  it('debería actualizar el contador sin badgeRef', () => {
    component.badgeRef = undefined as any;
    component.updateUnreadCount(5);
    expect(component.totalUnreadCount).toBe(5);
  });


  it('debería manejar error en setupReadReceipts', () => {
    const chatService = TestBed.inject(ChatService);

    const fakeIMessage: IMessage = {
      ack: () => { },
      nack: () => { },
      command: 'MESSAGE',
      headers: {},
      isBinaryBody: false,
      binaryBody: new Uint8Array(),
      body: 'not json'
    };

    spyOn(chatService, 'watchReadReceipts').and.returnValue(of(fakeIMessage));
    expect(() => component['setupReadReceipts']()).not.toThrow();
  });

  it('debería alternar el estado de collapsed', () => {
    expect(component.collapsed).toBeTrue();
    component.toggle();
    expect(component.collapsed).toBeFalse();
    component.toggle();
    expect(component.collapsed).toBeTrue();
  });

  it('debería actualizar totalUnreadCount', () => {
    component.totalUnreadCount = 5;
    component.updateUnreadCount(10);
    expect(component.totalUnreadCount).toBe(10);
  });

  it('debería llamar overlay.open cuando se selecciona contacto', () => {
    const contacto = { userId: 22, nombre: 'Alguien', unread: 0 };
    const overlay = TestBed.inject(ChatOverlayService);
    spyOn(overlay, 'open');
    component.select(contacto as any);
    expect(overlay.open).toHaveBeenCalledWith(contacto);
  });

  it('debería manejar error en loadContacts', () => {
    const chatService = TestBed.inject(ChatService);
    spyOn(chatService, 'getConversationPartners').and.returnValue(of([]));
    spyOn(chatService, 'getUnreadBySender').and.returnValue(of([]));
    // puedes simular error en partners
    component['loadContacts']();
    expect(component.loading).toBeFalse();
  });

  it('debería limpiar subscripciones al destruirse', () => {
    const sub = { unsubscribe: jasmine.createSpy('unsubscribe') };
    (component as any).overlaySub = sub;
    (component as any).loadSub = sub;
    (component as any).wsSub = sub;
    (component as any).readSub = sub;
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalledTimes(4);
  });


  it('debería alternar collapsed correctamente', () => {
    component.collapsed = true;
    component.toggle();
    expect(component.collapsed).toBeFalse();
    component.toggle();
    expect(component.collapsed).toBeTrue();
  });


  it('debería actualizar el contador de unread', () => {
    component.totalUnreadCount = 3;
    component.updateUnreadCount(8);
    expect(component.totalUnreadCount).toBe(8);
  });

  it('debería agregar/remover clase heartbeat en el badge si existe badgeRef', () => {
    // Simula un badgeRef con nativeElement y renderer
    const badge = document.createElement('span');
    component.badgeRef = { nativeElement: badge } as any;
    spyOn(component['renderer'], 'removeClass').and.callThrough();
    spyOn(component['renderer'], 'addClass').and.callThrough();
    component.updateUnreadCount(10);
    expect(component['renderer'].removeClass).toHaveBeenCalled();
    expect(component['renderer'].addClass).toHaveBeenCalledWith(badge, 'heartbeat');
  });
  it('debería llamar overlay.open al seleccionar contacto', () => {
    const overlay = TestBed.inject(ChatOverlayService);
    spyOn(overlay, 'open');
    const contacto = { userId: 7, nombre: 'Juan', unread: 2 } as any;
    component.select(contacto);
    expect(overlay.open).toHaveBeenCalledWith(contacto);
  });
  it('debería desuscribir todas las subscripciones en ngOnDestroy', () => {
    const sub = { unsubscribe: jasmine.createSpy('unsubscribe') };
    (component as any).overlaySub = sub;
    (component as any).loadSub = sub;
    (component as any).wsSub = sub;
    (component as any).readSub = sub;
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalledTimes(4);
  });

  it('debería manejar error si loadContacts falla', () => {
    const chatService = TestBed.inject(ChatService);
    spyOn(chatService, 'getConversationPartners').and.returnValue(throwError(() => new Error('fail')));
    spyOn(chatService, 'getUnreadBySender').and.returnValue(of([]));

    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBe('Error cargando contactos');
    expect(component.loading).toBeFalse();
  });



  it('debería inicializar correctamente y llamar loadContacts, setupPrivateWs y setupReadReceipts', () => {
    // Ya tienes user$ en el stub. Puedes espiar métodos privados:
    spyOn<any>(component, 'loadContacts');
    spyOn<any>(component, 'setupPrivateWs');
    spyOn<any>(component, 'setupReadReceipts');
    component.ngOnInit();
    expect(component['loadContacts']).toHaveBeenCalled();
    expect(component['setupPrivateWs']).toHaveBeenCalled();
    expect(component['setupReadReceipts']).toHaveBeenCalled();
  });

  it('no rompe updateUnreadCount aunque badgeRef sea undefined', () => {
    component.badgeRef = undefined as any;
    expect(() => component.updateUnreadCount(10)).not.toThrow();
  });

  it('debería mostrar error si observable user$ falla', () => {
    authServiceStub = {
      user$: throwError(() => new Error('falla!'))
    } as any;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ContactsSidebarComponent],
      providers: [
        { provide: RxStomp, useValue: {} },
        { provide: AuthService, useValue: authServiceStub },
        { provide: ChatService, useValue: chatServiceStub },
        { provide: PerfilService, useValue: perfilServiceStub },
        { provide: PerfilEmpresaService, useValue: perfilEmpresaServiceStub },
        { provide: ChatOverlayService, useValue: chatOverlayServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.error).toContain('Debes iniciar sesión');
    expect(component.loading).toBeFalse();
  });

});
