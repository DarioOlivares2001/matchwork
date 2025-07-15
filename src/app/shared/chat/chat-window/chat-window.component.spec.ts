import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatWindowComponent } from './chat-window.component';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { of, Subject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Contact } from '../../../models/contact.model';

describe('ChatWindowComponent', () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;

  let mockAuthService: any;
  let mockChatService: any;

  beforeEach(async () => {
    mockAuthService = {
      user$: of({ id: 1, rol: 'EMPRESA', nombre: 'Empresa Test' }),
      userSnapshot: { id: 1, rol: 'EMPRESA', nombre: 'Empresa Test' }
    };

    mockChatService = {
      watchPrivate: () => new Subject<any>(),
      markAsSeen: () => of(void 0),
      getHistory: () => of([]),
      watchReadReceipts: () => new Subject<any>(),
      sendMessage: jasmine.createSpy('sendMessage')
    };

    await TestBed.configureTestingModule({
      imports: [ChatWindowComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ChatService, useValue: mockChatService },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 👇👇👇 Aquí van los tests 👇👇👇

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería setear meNombre en ngOnInit', () => {
    expect(component.meNombre).toBe('Empresa Test');
  });

  it('debería suscribirse a user$ y setear meId e isEmpresa en el constructor', () => {
    expect(component.meId).toBe(1);
    expect(component.isEmpresa).toBeTrue();
  });

  it('debería enviar mensaje si hay texto y contacto', () => {
    component.contact = { userId: 2, nombre: 'Chanchito' } as Contact;
    component.newMessage = 'Hola mundo';

    component.sendMessage();

    expect(component.messages.length).toBe(1);
    expect(component.newMessage).toBe('');
    expect(mockChatService.sendMessage).toHaveBeenCalled();
  });

  it('no debería enviar mensaje si no hay contacto', () => {
    component.newMessage = 'Hola';
    component.sendMessage();
    expect(mockChatService.sendMessage).not.toHaveBeenCalled();
  });

  it('no debería enviar mensaje si está vacío', () => {
    component.contact = { userId: 2, nombre: 'Chanchito' } as Contact;
    component.newMessage = '   ';
    component.sendMessage();
    expect(mockChatService.sendMessage).not.toHaveBeenCalled();
  });

  it('debería alternar la propiedad minimized', () => {
    component.minimized = false;
    component.toggleMinimize();
    expect(component.minimized).toBeTrue();
    component.toggleMinimize();
    expect(component.minimized).toBeFalse();
  });

  it('debería emitir el evento close cuando se llama onCloseClicked', () => {
    spyOn(component.close, 'emit');
    component.onCloseClicked();
    expect(component.close.emit).toHaveBeenCalled();
  });
    it('debería llamar openChat() en ngOnChanges cuando cambia contact', () => {
    component.contact = { userId: 2, nombre: 'Chanchito' } as Contact;
    spyOn<any>(component, 'openChat');
    component.ngOnChanges({ contact: { currentValue: component.contact, previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect((component as any).openChat).toHaveBeenCalled();
  });

  it('debería desuscribir los chatSubs y reiniciarlos en openChat()', () => {
    // Creamos mocks para simular subs
    const fakeSub = { unsubscribe: jasmine.createSpy('unsubscribe') };
    (component as any).chatSubs = [fakeSub as any];
    component.contact = { userId: 2, nombre: 'Chanchito' } as Contact;
    component.meId = 1;
    component['chat'] = {
      markAsSeen: () => of(void 0),
      getHistory: () => of([]),
      watchReadReceipts: () => new Subject(),
      watchPrivate: () => new Subject()
    } as any;

    component['cdr'] = { detectChanges: () => null } as any;

    component['openChat']();
    expect(fakeSub.unsubscribe).toHaveBeenCalled();
    expect(component.minimized).toBeFalse();
    expect(component.messages).toEqual([]);
  });

  it('debería agregar mensaje al recibir un CHAT por socket', () => {
    const subj = new Subject<any>();
    mockChatService.watchPrivate = () => subj;
    component.contact = { userId: 2, nombre: 'Chanchito' } as Contact;
    component.meId = 1;
    component['cdr'] = { detectChanges: () => null } as any;
    component['scrollBottom'] = () => null;
    component['chat'] = mockChatService;

    component['openChat']();

    // Simular mensaje entrante tipo CHAT
    subj.next({
      body: JSON.stringify({
        type: 'CHAT',
        senderId: 2,
        receiverId: 1,
        content: 'Hola',
        timestamp: new Date().toISOString()
      })
    });

    expect(component.messages.length).toBe(1);
    expect(component.messages[0].content).toBe('Hola');
  });

  it('debería iniciar videollamada y enviar mensaje VIDEO_CALL', () => {
    component.contact = { userId: 2, nombre: 'Chanchito' } as Contact;
    component.meId = 1;
    component.isInVideoCall = false;

    component.startVideoCall();

    expect(component.isInVideoCall).toBeTrue();
    expect(component.videoRoomName).toBe('MatchWork_1_2');
    expect(mockChatService.sendMessage).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: 'VIDEO_CALL', senderId: 1, receiverId: 2 })
    );
  });

  it('debería setear flags al aceptar videollamada', () => {
    component.showVideoInvitation = true;
    component.isInVideoCall = false;
    component.acceptVideoCall();
    expect(component.showVideoInvitation).toBeFalse();
    expect(component.isInVideoCall).toBeTrue();
  });

  it('debería ocultar invitación al rechazar videollamada', () => {
    component.showVideoInvitation = true;
    component.declineVideoCall();
    expect(component.showVideoInvitation).toBeFalse();
  });

  it('debería enviar mensaje si se presiona enter (onEnter)', () => {
    spyOn(component, 'sendMessage');
    const event = { preventDefault: () => {}, shiftKey: false } as any;
    component.onEnter(event);
    expect(component.sendMessage).toHaveBeenCalled();
  });

  it('no debería enviar mensaje si se presiona shift+enter (onEnter)', () => {
    spyOn(component, 'sendMessage');
    const event = { preventDefault: () => {}, shiftKey: true } as any;
    component.onEnter(event);
    expect(component.sendMessage).not.toHaveBeenCalled();
  });

  it('debería desuscribir todos los globalSubs y chatSubs en ngOnDestroy', () => {
    const fakeSub1 = { unsubscribe: jasmine.createSpy('unsubscribe') };
    const fakeSub2 = { unsubscribe: jasmine.createSpy('unsubscribe') };
    component['globalSubs'] = [fakeSub1 as any];
    component['chatSubs'] = [fakeSub2 as any];
    component.ngOnDestroy();
    expect(fakeSub1.unsubscribe).toHaveBeenCalled();
    expect(fakeSub2.unsubscribe).toHaveBeenCalled();
  });

});
