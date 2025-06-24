
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { MatchService }      from '../../services/match.service';
import { TrabajoSugerido }   from '../../services/trabajo-sugerido.model';
import { switchMap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {
  trabajosSugeridos: TrabajoSugerido[] = [];
  cargando = false;

  constructor(
    private auth: AuthService,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    this.cargando = true;
    this.auth.user$
      .pipe(
        filter((u: User | null): u is User => u !== null),
        switchMap(u => this.matchService.getTrabajosSugeridos(u.id))
      )
      .subscribe({
        next: lista => {
          this.trabajosSugeridos = lista;
          this.cargando = false;
        },
        error: err => {
          console.error('Error al cargar trabajos sugeridos:', err);
          this.trabajosSugeridos = [];
          this.cargando = false;
        }
      });
  }
}
