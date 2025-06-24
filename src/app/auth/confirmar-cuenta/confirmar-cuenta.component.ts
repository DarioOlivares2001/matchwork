import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService }       from '../../services/auth.service';

@Component({
  selector: 'app-confirmar-cuenta',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './confirmar-cuenta.component.html',
  styleUrls: ['./confirmar-cuenta.component.css']
})
export class ConfirmarCuentaComponent implements OnInit {
  email = '';
  code = '';
  error = '';
  message = '';
  role = 'TRABAJADOR';
  redirect = '/ingreso-profesional';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email'])   this.email = params['email'];
      if (params['role'])    this.role  = params['role'];
      if (params['redirect'])this.redirect = params['redirect'];
    });
  }

  confirm() {
    this.auth.confirmAccount(this.email, this.code)
      .subscribe({
        next: res => {
          this.message = res.message;
          setTimeout(() => {
            // navega al login correspondiente
            this.router.navigateByUrl(this.redirect);
          }, 2000);
        },
        error: err => this.error = err.error?.error || 'Error al confirmar'
      });
  }
}
