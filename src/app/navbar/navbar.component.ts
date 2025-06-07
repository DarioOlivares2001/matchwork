// src/app/navbar/navbar.component.ts
import { Component }      from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService }    from '../services/auth.service';
import { Observable }     from 'rxjs';
import { User }           from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user$: Observable<User|null>;

  constructor(public auth: AuthService, private router: Router) {
    this.user$ = auth.user$;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
