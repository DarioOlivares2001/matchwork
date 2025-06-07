import { Component }    from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService }        from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private auth: AuthService) {}
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    // Si hay token en localStorage, recarga el perfil inmediatamente
    this.auth.loadUser();
  }
}
