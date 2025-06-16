import { Component }    from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService }        from './services/auth.service';
import { ContactsSidebarComponent }  from './shared/chat/contacts-sidebar/contacts-sidebar.component';
import { ChatWindowComponent }       from './shared/chat/chat-window/chat-window.component';
import { CommonModule, NgIf }   from '@angular/common';
import { ChatOverlayService }       from './services/chat-overlay.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, RouterOutlet, NavbarComponent,ContactsSidebarComponent, ChatWindowComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  constructor(public auth: AuthService, public overlay: ChatOverlayService) {}
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    if (this.auth.getToken()) {
      this.auth.loadUser().subscribe(); // dispara la carga inicial
    }
  }
}
