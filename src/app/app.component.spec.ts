import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ChatOverlayService } from './services/chat-overlay.service';
import { of, BehaviorSubject } from 'rxjs';
import { RxStomp } from '@stomp/rx-stomp';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let authServiceMock: any;
  let overlayMock: any;

  beforeEach(async () => {
    // Creamos mocks reactivos para los servicios (como usan observables)
    authServiceMock = {
      user$: new BehaviorSubject<any>(null)
    };
    overlayMock = {
      contact$: new BehaviorSubject<any>(null),
      close: jasmine.createSpy('close')
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AppComponent],
      providers: [
        provideRouter([]),
        { provide: RxStomp, useValue: { watch: () => of({}) } },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ChatOverlayService, useValue: overlayMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });


  it('debe renderizar el navbar', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });

  it('debe mostrar el sidebar de contactos si hay usuario logueado', () => {
    authServiceMock.user$.next({ id: 1, nombre: 'Dardilla', correo: 'dardilla@dev.cl', rol: 'PRO' });
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('app-contacts-sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('debe mostrar la ventana de chat si hay usuario y contacto', () => {
    authServiceMock.user$.next({ id: 1, nombre: 'Dardilla', correo: 'dardilla@dev.cl', rol: 'PRO' });
    overlayMock.contact$.next({ userId: 2, nombre: 'Chanchito', unread: 0 });
    fixture.detectChanges();
    const chatWin = fixture.nativeElement.querySelector('app-chat-window');
    expect(chatWin).toBeTruthy();
  });

  it('no muestra el sidebar ni el chat si no hay usuario', () => {
    authServiceMock.user$.next(null);
    overlayMock.contact$.next(null);
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('app-contacts-sidebar');
    const chatWin = fixture.nativeElement.querySelector('app-chat-window');
    expect(sidebar).toBeNull();
    expect(chatWin).toBeNull();
  });
});
