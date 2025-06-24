import { Component }    from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService, User }        from './services/auth.service';
import { ContactsSidebarComponent }  from './shared/chat/contacts-sidebar/contacts-sidebar.component';
import { ChatWindowComponent }       from './shared/chat/chat-window/chat-window.component';
import { CommonModule, NgIf }   from '@angular/common';
import { ChatOverlayService }       from './services/chat-overlay.service';
import { tap } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, RouterOutlet, NavbarComponent,ContactsSidebarComponent, ChatWindowComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentUser: User | null = null;
  
  constructor(public auth: AuthService, public overlay: ChatOverlayService) {}
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
     
    });
  }
}
